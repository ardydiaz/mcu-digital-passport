import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/environment.js';
import { sessionConfig } from '../config/entra.js';

const key = new TextEncoder().encode(env.SESSION_JWT_SECRET);

/** Issues the app's session JWT after a successful Microsoft sign-in. */
export function issueSessionToken({ id, oid, tenantId, email, name, loginHint }, { ttlSeconds = sessionConfig.ttlSeconds } = {}) {
  // uid = users.id in the database; sub = Microsoft Entra object id; lh = Microsoft login_hint (for sign-out).
  // Roles are NOT stored in the token: they are read from the database on every request.
  return new SignJWT({ uid: id, tid: tenantId, email, name, ...(loginHint && { lh: loginHint }) })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(oid)
    .setIssuer(sessionConfig.issuer)
    .setAudience(sessionConfig.audience)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(key);
}

/** Verifies a session JWT; throws if invalid or expired. */
export async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, key, {
    issuer: sessionConfig.issuer,
    audience: sessionConfig.audience,
    algorithms: ['HS256'],
  });
  return payload;
}

/** Short-lived signed value for the sign-in round trip (state, PKCE verifier, return path). */
export function signTransaction(data) {
  return new SignJWT(data)
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience('mcu-auth-transaction')
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(key);
}

export async function verifyTransaction(token) {
  const { payload } = await jwtVerify(token, key, { audience: 'mcu-auth-transaction', algorithms: ['HS256'] });
  return payload;
}
