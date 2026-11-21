import { ApiError } from '../utils/ApiError.js';

/** Marks a middleware as an authorization check, so tests can prove every route has one. */
export const AUTHORIZATION = Symbol('authorization');

/**
 * Requires ALL of the given permissions (see config/permissions.js).
 * Usage: router.post('/', authorize(PERMISSIONS.ACTIVITIES_CREATE), handler)
 */
export const authorizePermission = (...required) => {
  if (!required.length) throw new Error('authorizePermission needs at least one permission');

  const middleware = (req, res, next) => {
    const granted = req.user?.permissions ?? [];
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    if (!required.every((p) => granted.includes(p))) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
  middleware[AUTHORIZATION] = { permissions: required };
  return middleware;
};

/** Short alias used in route files. */
export const authorize = authorizePermission;
