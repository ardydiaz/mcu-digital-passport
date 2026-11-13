import { ApiError } from '../utils/ApiError.js';

/**
 * Usage: router.get('/x', authenticateJWT, authorizeRole('Admin', 'Organizer'), handler)
 */
export const authorizeRole = (...allowedRoles) => (req, res, next) => {
  const roles = req.user?.roles ?? [];
  if (!roles.some((role) => allowedRoles.includes(role))) {
    return next(ApiError.forbidden('Insufficient role'));
  }
  next();
};
