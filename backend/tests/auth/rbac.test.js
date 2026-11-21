import '../helpers/env.js';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { API_MODULES } from '../../src/app.js';
import { AUTHORIZATION } from '../../src/middleware/authorizePermission.js';
import { ROLES, ROLE_PERMISSIONS, PERMISSIONS } from '../../src/config/permissions.js';
import { request, startTestServer } from '../helpers/testServer.js';

/** Every route in the API: [{ method, path, handlers }] (plus the health check). */
function listRoutes() {
  const routes = [{ method: 'GET', path: '/api/health', handlers: null }];
  for (const [prefix, router] of API_MODULES) {
    for (const layer of router.stack) {
      if (!layer.route) continue;
      for (const method of Object.keys(layer.route.methods)) {
        routes.push({
          method: method.toUpperCase(),
          path: `/api${prefix}${layer.route.path === '/' ? '' : layer.route.path}`,
          handlers: layer.route.stack.map((l) => l.handle),
        });
      }
    }
  }
  return routes;
}

/** Fill route params with sample values, e.g. /api/activities/:id -> /api/activities/1 */
const concrete = (path) =>
  path.replace(':oid', '00000000-0000-4000-8000-000000000000').replace(/:[a-zA-Z]+/g, '1');

let server;
before(async () => {
  server = await startTestServer();
});
after(() => server.close());

describe('every endpoint is protected', () => {
  const routes = listRoutes();

  test('the API has routes to check', () => {
    assert.ok(routes.length > 20, `expected many routes, found ${routes.length}`);
  });

  test('every route declares an authorization check (authorize/authorizeRole)', () => {
    const missing = routes
      .filter((r) => r.handlers && !r.handlers.some((h) => h[AUTHORIZATION]))
      .map((r) => `${r.method} ${r.path}`);
    assert.deepEqual(missing, [], `routes without authorize(): ${missing.join(', ')}`);
  });

  test('every route returns 401 without a token', async () => {
    for (const { method, path } of routes) {
      const res = await request(server.baseUrl, method, concrete(path));
      assert.equal(res.status, 401, `${method} ${path} should require a token, got ${res.status}`);
    }
  });

  test('unknown /api routes also return 401 without a token (no route discovery)', async () => {
    const res = await request(server.baseUrl, 'GET', '/api/does-not-exist');
    assert.equal(res.status, 401);
  });
});

describe('token verification', () => {
  test('valid token is accepted', async () => {
    const res = await request(server.baseUrl, 'GET', '/api/auth/me', { token: await server.sign() });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.roles, ['Student']);
    assert.ok(res.body.data.permissions.includes(PERMISSIONS.PASSPORT_READ_OWN));
  });

  test('malformed token -> 401', async () => {
    const res = await request(server.baseUrl, 'GET', '/api/auth/me', { token: 'not-a-jwt' });
    assert.equal(res.status, 401);
  });

  test('token signed with another key -> 401', async () => {
    const res = await request(server.baseUrl, 'GET', '/api/auth/me', { token: await server.sign({ wrongKey: true }) });
    assert.equal(res.status, 401);
  });

  test('expired token -> 401', async () => {
    const res = await request(server.baseUrl, 'GET', '/api/auth/me', { token: await server.sign({ expired: true }) });
    assert.equal(res.status, 401);
  });

  test('session cookie is accepted (browser)', async () => {
    const res = await request(server.baseUrl, 'GET', '/api/auth/me', { cookie: `mcu_session=${await server.sign()}` });
    assert.equal(res.status, 200);
  });

  test('tampered token -> 401', async () => {
    const token = await server.sign();
    const [h, p, s] = token.split('.');
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString());
    payload.roles = ['Admin']; // try to promote yourself
    const forged = `${h}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${s}`;
    const res = await request(server.baseUrl, 'GET', '/api/reports/participation', { token: forged });
    assert.equal(res.status, 401);
  });

  test('non-MCU email domain -> 403', async () => {
    const res = await request(server.baseUrl, 'GET', '/api/auth/me', { token: await server.sign({ email: 'someone@gmail.com' }) });
    assert.equal(res.status, 403);
  });

  test('staff account without a role gets no access to features', async () => {
    const token = await server.sign({ email: 'teacher@mcu.edu.ph' });
    // ...but can still load their own profile, so the app can show "No access yet"
    const me = await request(server.baseUrl, 'GET', '/api/auth/me', { token });
    assert.equal(me.status, 200);
    assert.deepEqual(me.body.data.roles, []);
    assert.deepEqual(me.body.data.permissions, ['profile:read:own']);
    assert.equal((await request(server.baseUrl, 'GET', '/api/passports/me', { token })).status, 403);
    assert.equal((await request(server.baseUrl, 'GET', '/api/activities', { token })).status, 403);
  });
});

describe('role-based access', () => {
  const tokens = {};
  before(async () => {
    tokens.student = await server.sign();
    tokens.organizer = await server.sign({ email: 'org@mcu.edu.ph', roles: [ROLES.ORGANIZER] });
    tokens.admin = await server.sign({ email: 'sasd@mcu.edu.ph', roles: [ROLES.ADMIN] });
    tokens.it = await server.sign({ email: 'ict@mcu.edu.ph', roles: [ROLES.IT_ADMIN] });
    tokens.targetId = (await server.signUser({ email: 'target@mcu.edu.ph' })).id;
  });

  // [who, method, path, body, allowed?]. Allowed requests reach the handler: 501 (not built yet) or 400 (validation).
  const scan = { activityId: 1, qrToken: 'MCU-1234-ABCD' };
  const manual = { studentId: '2023-04387', activityId: 1, justification: 'Scanner was offline during the event' };
  const cases = [
    ['student', 'GET', '/api/passports/me', null, true],
    ['student', 'POST', '/api/passports/me/qr-token', null, true],
    ['student', 'GET', '/api/bucket-list/me', null, true],
    ['student', 'GET', '/api/activities', null, true],
    ['student', 'POST', '/api/activities', null, false],
    ['student', 'POST', '/api/attendance/scan', scan, false],
    ['student', 'GET', '/api/students', null, false],
    ['student', 'GET', '/api/reports/participation', null, false],
    ['student', 'GET', '/api/passports/2023-00001', null, false],

    ['organizer', 'POST', '/api/attendance/scan', scan, true],
    ['organizer', 'POST', '/api/attendance/1/validate', null, true],
    ['organizer', 'POST', '/api/activities', null, true],
    ['organizer', 'DELETE', '/api/activities/1', null, false],
    ['organizer', 'POST', '/api/attendance/manual', manual, false],
    ['organizer', 'GET', '/api/reports/participation', null, false],
    ['organizer', 'GET', '/api/passports/me', null, false],

    ['admin', 'GET', '/api/reports/participation', null, true],
    ['admin', 'POST', '/api/attendance/manual', manual, true],
    ['admin', 'GET', '/api/students', null, true],
    ['admin', 'GET', '/api/audit', null, true],
    ['admin', 'PUT', '/api/users/TARGET/roles', { roles: ['Organizer'] }, false],

    ['it', 'PUT', '/api/users/TARGET/roles', { roles: ['Organizer'] }, true],
    ['it', 'GET', '/api/audit', null, true],
    ['it', 'GET', '/api/reports/participation', null, true],
    ['it', 'POST', '/api/attendance/manual', manual, true],
    ['it', 'GET', '/api/passports/me', null, true],
    ['it', 'POST', '/api/attendance/scan', scan, true],
    ['it', 'DELETE', '/api/activities/1', null, true],
  ];

  for (const [who, method, path, body, allowed] of cases) {
    test(`${who} ${allowed ? 'CAN' : 'CANNOT'} ${method} ${path}`, async () => {
      const res = await request(server.baseUrl, method, path.replace('TARGET', tokens.targetId), { token: tokens[who], body });
      if (allowed) assert.ok([200, 400, 501].includes(res.status), `expected access, got ${res.status}`);
      else assert.equal(res.status, 403, `expected 403, got ${res.status}`);
    });
  }

  test('manual correction without a justification is rejected (400)', async () => {
    const res = await request(server.baseUrl, 'POST', '/api/attendance/manual', {
      token: tokens.admin,
      body: { studentId: '2023-04387', activityId: 1, justification: 'short' },
    });
    assert.equal(res.status, 400);
  });

  test('every role has permissions, and none grants unknown permissions', () => {
    const known = new Set(Object.values(PERMISSIONS));
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      assert.ok(perms.length > 0, `${role} has no permissions`);
      for (const p of perms) assert.ok(known.has(p), `${role} has unknown permission ${p}`);
    }
  });
});

test('ITAdmin has every permission', () => {
  assert.deepEqual([...ROLE_PERMISSIONS[ROLES.IT_ADMIN]].sort(), Object.values(PERMISSIONS).sort());
});
