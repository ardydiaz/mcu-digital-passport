import { accountDomains, sessionConfig } from '../config/entra.js';
import { permissionsForRoles } from '../config/permissions.js';
import { ApiError } from '../utils/ApiError.js';
import { getEmailDomain } from '../utils/accountDomain.js';
import { verifySessionToken } from '../utils/sessionToken.js';
import * as usersRepository from '../modules/users/users.repository.js';

/**
 * Verifies the app's session JWT, issued by the backend after Microsoft 365 sign-in.
 * The token is read from the httpOnly session cookie (browser) or "Authorization: Bearer <token>" (other clients).
 *
 * Roles and active status are loaded from the DATABASE on every request (roles are managed in the system),
 * so a role change or deactivation applies immediately, without signing in again.
 *
 * On success: req.user = { id, oid, tenantId, email, domain, name, roles, permissions }.
 */
export function createAuthenticateJWT({ verify = verifySessionToken, users = usersRepository, domains = accountDomains } = {}) {
  return async function authenticateJWT(req, res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.[sessionConfig.cookieName];
    if (!token) return next(ApiError.unauthorized('Please sign in'));

    let payload;
    try {
      payload = await verify(token);
    } catch {
      return next(ApiError.unauthorized('Your session is invalid or has expired. Please sign in again.'));
    }

    // Defense in depth: the domain was checked at sign-in, check again on every request.
    const domain = getEmailDomain(payload.email);
    if (!domain || !domains.allowed.includes(domain)) {
      return next(ApiError.forbidden('Please sign in with your MCU Microsoft 365 account'));
    }

    let state;
    try {
      state = payload.uid ? await users.findAuthState(payload.uid) : null;
    } catch (err) {
      return next(err);
    }
    if (!state) return next(ApiError.unauthorized('Your account was not found. Please sign in again.'));
    if (!state.isActive) return next(ApiError.unauthorized('Your account has been deactivated.'));

    req.user = {
      id: payload.uid, // users.id
      oid: payload.sub,
      tenantId: payload.tid,
      email: payload.email,
      domain,
      name: payload.name,
      roles: state.roles,
      permissions: permissionsForRoles(state.roles),
    };
    next();
  };
}

export const authenticateJWT = createAuthenticateJWT();
