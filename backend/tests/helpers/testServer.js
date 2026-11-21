import './env.js';
import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import { createApp } from '../../src/app.js';
import { UserRuleError } from '../../src/modules/users/users.repository.js';
import { issueSessionToken } from '../../src/utils/sessionToken.js';

export const TENANT_ID = process.env.ENTRA_TENANT_ID;
export const FRONTEND = process.env.FRONTEND_URL;

/**
 * A fake Microsoft: getSignInUrl returns a URL carrying the state; redeemCode returns `fakeMicrosoft.claims`.
 * Tests set fakeMicrosoft.claims to simulate who signed in.
 */
export const fakeMicrosoft = {
  claims: null,
  async getSignInUrl({ state, prompt, loginHint }) {
    const url = new URL('https://login.microsoftonline.com/fake/authorize');
    url.searchParams.set('state', state);
    if (prompt) url.searchParams.set('prompt', prompt);
    if (loginHint) url.searchParams.set('login_hint', loginHint);
    return { url: url.toString(), codeVerifier: 'test-verifier' };
  },
  async redeemCode({ code, codeVerifier }) {
    if (code !== 'good-code' || codeVerifier !== 'test-verifier') throw new Error('bad code');
    return this.claims;
  },
};

/** In-memory stand-in for the users and user_roles tables (same functions as users.repository.js). */
export const fakeUsers = {
  rows: new Map(), // id -> { id, oid, email, name, accountType, roles, isActive, loginCount }
  audit: [],
  nextId: 1,
  reset() {
    this.rows.clear();
    this.audit = [];
    this.nextId = 1;
  },
  /** Adds a user directly (as if they had signed in before). Returns the id. */
  add({ roles = [], isActive = true, ...user }) {
    const id = this.nextId++;
    this.rows.set(id, { ...user, id, roles: [...roles].sort(), isActive, loginCount: 0 });
    return id;
  },
  view(u) {
    return { id: u.id, email: u.email, name: u.name, accountType: u.accountType, isActive: u.isActive, roles: [...u.roles] };
  },
  async upsertOnSignIn(user) {
    const existing = [...this.rows.values()].find((u) => u.oid === user.oid);
    if (existing && !existing.isActive) return { disabled: true };
    if (existing) {
      Object.assign(existing, { email: user.email, name: user.name, accountType: user.accountType });
      existing.loginCount += 1;
      return { id: existing.id, isNew: false, roles: existing.roles };
    }
    const id = this.add({ ...user, roles: user.accountType === 'student' ? ['Student'] : [] });
    this.rows.get(id).loginCount = 1;
    return { id, isNew: true, roles: this.rows.get(id).roles };
  },
  async findAuthState(id) {
    const u = this.rows.get(id);
    return u ? { isActive: u.isActive, roles: [...u.roles] } : null;
  },
  async findProfile(id) {
    const u = this.rows.get(id);
    return u ? { ...this.view(u), student: null } : null;
  },
  async findById(id) {
    const u = this.rows.get(id);
    return u ? this.view(u) : null;
  },
  async listUsers({ page = 1, pageSize = 20, role } = {}) {
    let items = [...this.rows.values()];
    if (role === 'none') items = items.filter((u) => !u.roles.length);
    else if (role) items = items.filter((u) => u.roles.includes(role));
    return { items: items.slice((page - 1) * pageSize, page * pageSize).map((u) => this.view(u)), page, pageSize, total: items.length };
  },
  activeItAdmins(exceptId) {
    return [...this.rows.values()].filter((u) => u.id !== exceptId && u.isActive && u.roles.includes('ITAdmin')).length;
  },
  async setRoles({ userId, roles, actorId, justification }) {
    const u = this.rows.get(userId);
    if (!u) return null;
    const after = [...new Set(roles)].sort();
    if (u.roles.includes('ITAdmin') && !after.includes('ITAdmin') && !this.activeItAdmins(userId)) {
      throw new UserRuleError('At least one active IT Administrator must remain.');
    }
    this.audit.push({ action: 'user.roles_changed', userId, actorId, justification, before: u.roles, after });
    u.roles = after;
    return this.view(u);
  },
  async setActive({ userId, isActive, actorId }) {
    const u = this.rows.get(userId);
    if (!u) return null;
    if (!isActive && u.roles.includes('ITAdmin') && !this.activeItAdmins(userId)) {
      throw new UserRuleError('The last active IT Administrator cannot be deactivated.');
    }
    this.audit.push({ action: isActive ? 'user.activated' : 'user.deactivated', userId, actorId });
    u.isActive = isActive;
    return this.view(u);
  },
};

export const msClaims = ({ email = 'juan@student.mcu.edu.ph', tid = TENANT_ID, roles } = {}) => ({
  tid,
  oid: randomUUID(),
  preferred_username: email,
  name: 'Test User',
  ...(roles && { roles }),
});

/** Starts the real app on a random port with the fake Microsoft and fake database. Returns { baseUrl, sign, close }. */
export async function startTestServer() {
  const app = createApp({ users: fakeUsers, signIn: fakeMicrosoft, isConfigured: () => true });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  /**
   * Creates a user with the given roles (in the fake database) and returns a session JWT for them.
   * { wrongKey } / { expired } make bad tokens. Returns the token; the user id is on token.userId... see signUser.
   */
  async function signUser({ email = 'juan@student.mcu.edu.ph', roles = email.endsWith('@student.mcu.edu.ph') ? ['Student'] : [], wrongKey, expired } = {}) {
    const user = { oid: randomUUID(), tenantId: TENANT_ID, email, name: 'Test User' };
    user.id = fakeUsers.add({ ...user, roles, accountType: email.endsWith('@student.mcu.edu.ph') ? 'student' : 'staff' });
    if (!wrongKey && !expired) return { id: user.id, token: await issueSessionToken(user) };
    const secret = new TextEncoder().encode(wrongKey ? 'another-secret-another-secret-another-secret' : process.env.SESSION_JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({ uid: user.id, tid: TENANT_ID, email, name: 'Test User' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.oid)
      .setIssuer('mcu-digital-passport')
      .setAudience('mcu-digital-passport-api')
      .setIssuedAt(now - 7200)
      .setExpirationTime(expired ? now - 60 : now + 3600)
      .sign(secret);
    return { id: user.id, token };
  }

  /** Shortcut: just the token. */
  const sign = async (opts) => (await signUser(opts)).token;

  return { baseUrl, sign, signUser, close: () => new Promise((resolve) => server.close(resolve)) };
}

/**
 * fetch wrapper: request(baseUrl, 'GET', '/api/x', { token, cookie, origin, body })
 * -> { status, body, location, cookies }   (redirects are not followed)
 */
export async function request(baseUrl, method, path, { token, cookie, origin, body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    redirect: 'manual',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(cookie && { Cookie: cookie }),
      ...(origin && { Origin: origin }),
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, body: json, location: res.headers.get('location'), cookies: res.headers.getSetCookie() };
}

/** "name=value; Path=/; HttpOnly" list -> { name: { value, raw } } */
export function parseCookies(setCookies) {
  return Object.fromEntries(
    setCookies.map((raw) => {
      const [pair] = raw.split(';');
      const i = pair.indexOf('=');
      return [pair.slice(0, i), { value: pair.slice(i + 1), raw }];
    }),
  );
}
