import { ApiError } from '../utils/ApiError.js';

/**
 * Usage: router.post('/x', authenticateJWT, authorizePermission('activities:create'), handler)
 * Expects req.user.permissions to be populated (e.g. loaded from the database after authentication).
 */
export const authorizePermission = (...required) => (req, res, next) => {
  const permissions = req.user?.permissions ?? [];
  if (!required.every((p) => permissions.includes(p))) {
    return next(ApiError.forbidden('Missing required permission'));
  }
  next();
};
