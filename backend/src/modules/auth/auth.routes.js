import { Router } from 'express';
import { authenticateJWT } from '../../middleware/authenticateJWT.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as authController from './auth.controller.js';

const router = Router();

// GET /api/auth/me — returns the authenticated user's profile
router.get('/me', authenticateJWT, asyncHandler(authController.me));

export default router;
