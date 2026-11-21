import { ApiError } from '../utils/ApiError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF protection for cookie-based sessions: state-changing requests (POST, PUT, PATCH, DELETE) coming
 * from a browser must come from an allowed frontend origin. Works together with SameSite=Lax cookies.
 */
export const originCheck = (allowedOrigins) => (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return next(ApiError.forbidden('Request origin not allowed'));
  }
  next();
};
