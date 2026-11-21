import { Router } from 'express';
import { authorize } from '../../middleware/authorizePermission.js';
import { PERMISSIONS } from '../../config/permissions.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authController } from './auth.controller.js';

/**
 * PUBLIC sign-in routes (the user has no session yet). These are the ONLY unauthenticated endpoints.
 * Mounted at /api/auth before the authentication middleware. The callback is mounted separately at the
 * path of ENTRA_REDIRECT_URI (see app.js).
 */
export function createPublicAuthRouter(controller = authController) {
  const router = Router();
  router.get('/login', asyncHandler(controller.login));
  router.post('/logout', asyncHandler(controller.logout));
  return router;
}

/** PROTECTED auth routes. Mounted at /api/auth after authentication. */
export function createProtectedAuthRouter(controller = authController) {
  const router = Router();
  router.get('/me', authorize(PERMISSIONS.PROFILE_READ_OWN), asyncHandler(controller.me));
  return router;
}

export default createProtectedAuthRouter();
