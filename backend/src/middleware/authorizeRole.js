import { ApiError } from '../utils/ApiError.js';
import { AUTHORIZATION } from './authorizePermission.js';

/**
 * Requires at least one of the given roles. Prefer authorize(PERMISSION) in routes, so access rules
 * stay in config/permissions.js. Use this only when a rule truly depends on the role itself.
 * Usage: router.get('/x', authorizeRole(ROLES.ADMIN), handler)
 */
export const authorizeRole = (...allowedRoles) => {
  if (!allowedRoles.length) throw new Error('authorizeRole needs at least one role');

  const middleware = (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    const roles = req.user.roles ?? [];
    if (!roles.some((role) => allowedRoles.includes(role))) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
  middleware[AUTHORIZATION] = { roles: allowedRoles };
  return middleware;
};
