import '../helpers/env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PUBLIC_ENDPOINTS } from '../../src/app.js';
import { FRONTEND, fakeMicrosoft, fakeUsers, msClaims, parseCookies, request, startTestServer } from '../helpers/testServer.js';

let server;
before(async () => {
  server = await startTestServer();
});
after(() => server.close());
beforeEach(() => {
  fakeMicrosoft.claims = msClaims();
});

/** Runs GET /api/auth/login and returns { state, txCookie, location }. */
async function startLogin(query = '') {
  const res = await request(server.baseUrl, 'GET', `/api/auth/login${query}`);
  assert.equal(res.status, 302);
  const location = new URL(res.location);
  const tx = parseCookies(res.cookies).mcu_auth_tx;
  return { state: location.searchParams.get('state'), location, txCookie: `mcu_auth_tx=${tx.value}`, txRaw: tx.raw };
}

describe('backend Microsoft 365 sign-in', () => {
  test('only the sign-in endpoints are public', () => {
    assert.deepEqual(PUBLIC_ENDPOINTS, ['GET /api/auth/login', 'POST /api/auth/logout', 'GET /auth/callback']);
  });

  test('login redirects to Microsoft with a state and an httpOnly transaction cookie', async () => {
    const { location, state, txRaw } = await startLogin();
    assert.equal(location.hostname, 'login.microsoftonline.com');
    assert.ok(state);
    assert.equal(location.searchParams.get('prompt'), 'select_account');
    assert.match(txRaw, /HttpOnly/i);
    assert.match(txRaw, /SameSite=Lax/i);
  });

  test('portal single sign-on (sso=1) skips the account picker and passes login_hint', async () => {
    const { location } = await startLogin('?sso=1&login_hint=juan@student.mcu.edu.ph');
    assert.equal(location.searchParams.get('prompt'), null);
    assert.equal(location.searchParams.get('login_hint'), 'juan@student.mcu.edu.ph');
  });

  test('full flow: callback issues an httpOnly session cookie that works on the API', async () => {
    const { state, txCookie } = await startLogin('?returnTo=/student/qr');
    const cb = await request(server.baseUrl, 'GET', `/auth/callback?code=good-code&state=${state}`, { cookie: txCookie });

    assert.equal(cb.status, 302);
    assert.equal(cb.location, `${FRONTEND}/student/qr`);
    const session = parseCookies(cb.cookies).mcu_session;
    assert.ok(session, 'session cookie set');
    assert.match(session.raw, /HttpOnly/i);

    const me = await request(server.baseUrl, 'GET', '/api/auth/me', { cookie: `mcu_session=${session.value}` });
    assert.equal(me.status, 200);
    assert.equal(me.body.data.email, 'juan@student.mcu.edu.ph');
    assert.deepEqual(me.body.data.roles, ['Student']);
  });

  test('sign-in saves the user: created the first time, updated (not duplicated) the next time', async () => {
    fakeUsers.reset();
    fakeMicrosoft.claims = msClaims({ email: 'Maria@Student.MCU.edu.ph' });
    for (let i = 0; i < 2; i += 1) {
      const { state, txCookie } = await startLogin();
      const cb = await request(server.baseUrl, 'GET', `/auth/callback?code=good-code&state=${state}`, { cookie: txCookie });
      assert.equal(cb.location, `${FRONTEND}/`);
    }
    const rows = [...fakeUsers.rows.values()];
    assert.equal(rows.length, 1, 'one user row');
    assert.equal(rows[0].email, 'maria@student.mcu.edu.ph', 'email stored lowercase');
    assert.equal(rows[0].accountType, 'student');
    assert.equal(rows[0].loginCount, 2);
  });

  test('deactivated account cannot sign in', async () => {
    fakeMicrosoft.claims = msClaims({ email: 'blocked@student.mcu.edu.ph' });
    fakeUsers.add({ oid: fakeMicrosoft.claims.oid, email: 'blocked@student.mcu.edu.ph', accountType: 'student', isActive: false });
    const { state, txCookie } = await startLogin();
    const cb = await request(server.baseUrl, 'GET', `/auth/callback?code=good-code&state=${state}`, { cookie: txCookie });
    assert.equal(cb.location, `${FRONTEND}/?auth_error=disabled`);
    assert.equal(parseCookies(cb.cookies).mcu_session?.value ?? '', '');
  });

  /** Signs in through the full flow and returns the /api/auth/me body. */
  async function signInAndGetMe(claims) {
    fakeMicrosoft.claims = claims;
    const { state, txCookie } = await startLogin();
    const cb = await request(server.baseUrl, 'GET', `/auth/callback?code=good-code&state=${state}`, { cookie: txCookie });
    const session = parseCookies(cb.cookies).mcu_session.value;
    return (await request(server.baseUrl, 'GET', '/api/auth/me', { cookie: `mcu_session=${session}` })).body.data;
  }

  test('new student account gets the Student role automatically', async () => {
    const me = await signInAndGetMe(msClaims({ email: 'new.student@student.mcu.edu.ph' }));
    assert.deepEqual(me.roles, ['Student']);
  });

  test('new staff account gets no role until an IT Administrator assigns one', async () => {
    const me = await signInAndGetMe(msClaims({ email: 'new.staff@mcu.edu.ph' }));
    assert.deepEqual(me.roles, []);
  });

  test('roles sent by Microsoft are ignored (roles are managed in the system)', async () => {
    const me = await signInAndGetMe(msClaims({ email: 'sneaky@mcu.edu.ph', roles: ['ITAdmin', 'Admin'] }));
    assert.deepEqual(me.roles, []);
  });

  test('signing in again keeps the roles assigned in the system', async () => {
    const claims = msClaims({ email: 'organizer@mcu.edu.ph' });
    await signInAndGetMe(claims);
    const user = [...fakeUsers.rows.values()].find((u) => u.oid === claims.oid);
    user.roles = ['Organizer'];
    const me = await signInAndGetMe(claims);
    assert.deepEqual(me.roles, ['Organizer']);
  });

  test('unsafe returnTo is ignored (no open redirect)', async () => {
    const { state, txCookie } = await startLogin('?returnTo=//evil.com');
    const cb = await request(server.baseUrl, 'GET', `/auth/callback?code=good-code&state=${state}`, { cookie: txCookie });
    assert.equal(cb.location, `${FRONTEND}/`);
  });

  test('non-MCU account is refused (no session)', async () => {
    fakeMicrosoft.claims = msClaims({ email: 'someone@gmail.com' });
    const { state, txCookie } = await startLogin();
    const cb = await request(server.baseUrl, 'GET', `/auth/callback?code=good-code&state=${state}`, { cookie: txCookie });
    assert.equal(cb.location, `${FRONTEND}/?auth_error=wrong_account`);
    assert.equal(parseCookies(cb.cookies).mcu_session?.value ?? '', '');
  });

  test('account from another tenant is refused', async () => {
    fakeMicrosoft.claims = msClaims({ tid: '22222222-2222-2222-2222-222222222222' });
    const { state, txCookie } = await startLogin();
    const cb = await request(server.baseUrl, 'GET', `/auth/callback?code=good-code&state=${state}`, { cookie: txCookie });
    assert.equal(cb.location, `${FRONTEND}/?auth_error=wrong_account`);
  });

  test('state mismatch is refused (CSRF on the callback)', async () => {
    const { txCookie } = await startLogin();
    const cb = await request(server.baseUrl, 'GET', '/auth/callback?code=good-code&state=attacker-state', { cookie: txCookie });
    assert.equal(cb.location, `${FRONTEND}/?auth_error=failed`);
  });

  test('callback without the transaction cookie is refused', async () => {
    const cb = await request(server.baseUrl, 'GET', '/auth/callback?code=good-code&state=x');
    assert.equal(cb.location, `${FRONTEND}/?auth_error=expired`);
  });

  test('user cancelling at Microsoft returns a friendly error', async () => {
    const { state, txCookie } = await startLogin();
    const cb = await request(server.baseUrl, 'GET', `/auth/callback?error=access_denied&state=${state}`, { cookie: txCookie });
    assert.equal(cb.location, `${FRONTEND}/?auth_error=cancelled`);
  });

  test('logout clears the session cookie and returns the Microsoft sign-out URL', async () => {
    const res = await request(server.baseUrl, 'POST', '/api/auth/logout', { origin: FRONTEND });
    assert.equal(res.status, 200);
    assert.match(res.body.data.logoutUrl, /^https:\/\/login\.microsoftonline\.com\/.+\/oauth2\/v2\.0\/logout/);
    assert.match(parseCookies(res.cookies).mcu_session.raw, /Expires=Thu, 01 Jan 1970/);
  });

  test('logout tells Microsoft which account to sign out (logout_hint), so no account picker is shown', async () => {
    fakeMicrosoft.claims = { ...msClaims({ email: 'hint@student.mcu.edu.ph' }), login_hint: 'O.aHint-From-Microsoft' };
    const { state, txCookie } = await startLogin();
    const cb = await request(server.baseUrl, 'GET', `/auth/callback?code=good-code&state=${state}`, { cookie: txCookie });
    const session = parseCookies(cb.cookies).mcu_session.value;

    const res = await request(server.baseUrl, 'POST', '/api/auth/logout', { cookie: `mcu_session=${session}`, origin: FRONTEND });
    const url = new URL(res.body.data.logoutUrl);
    assert.equal(url.searchParams.get('logout_hint'), 'O.aHint-From-Microsoft');
    assert.equal(url.searchParams.get('post_logout_redirect_uri'), FRONTEND);
  });

  test('logout without a session still works (no hint)', async () => {
    const res = await request(server.baseUrl, 'POST', '/api/auth/logout', { origin: FRONTEND });
    assert.equal(res.status, 200);
    assert.equal(new URL(res.body.data.logoutUrl).searchParams.get('logout_hint'), null);
  });

  test('state-changing requests from another website are blocked (CSRF)', async () => {
    const cookie = `mcu_session=${await server.sign({ email: 'sasd@mcu.edu.ph', roles: ['Admin'] })}`;
    const res = await request(server.baseUrl, 'POST', '/api/attendance/manual', {
      cookie,
      origin: 'https://evil.example.com',
      body: { studentId: '1', activityId: 1, justification: 'not a real request at all' },
    });
    assert.equal(res.status, 403);
  });
});
