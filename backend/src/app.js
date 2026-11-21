import express, { Router } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/environment.js';
import { PERMISSIONS } from './config/permissions.js';
import { createAuthenticateJWT } from './middleware/authenticateJWT.js';
import { authorize } from './middleware/authorizePermission.js';
import { originCheck } from './middleware/originCheck.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { asyncHandler } from './utils/asyncHandler.js';

import { createAuthController } from './modules/auth/auth.controller.js';
import authRoutes, { createProtectedAuthRouter, createPublicAuthRouter } from './modules/auth/auth.routes.js';
import * as usersRepository from './modules/users/users.repository.js';
import userRoutes, { createUsersRouter } from './modules/users/users.routes.js';
import passportRoutes from './modules/passports/passports.routes.js';
import bucketListRoutes from './modules/bucketlist/bucketlist.routes.js';
import activityRoutes from './modules/activities/activities.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import studentRoutes from './modules/students/students.routes.js';
import reportRoutes from './modules/reports/reports.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import importRoutes from './modules/imports/imports.routes.js';

/** Protected API modules, mounted under /api. Each route inside declares the permission it needs. */
export const API_MODULES = [
  ['/auth', authRoutes],
  ['/passports', passportRoutes],
  ['/bucket-list', bucketListRoutes],
  ['/activities', activityRoutes],
  ['/attendance', attendanceRoutes],
  ['/students', studentRoutes],
  ['/reports', reportRoutes],
  ['/users', userRoutes],
  ['/audit', auditRoutes],
  ['/imports', importRoutes],
];

/** The callback path registered in Entra, e.g. http://localhost:5173/auth/callback -> /auth/callback */
export const CALLBACK_PATH = new URL(env.ENTRA_REDIRECT_URI).pathname;

/** The ONLY endpoints reachable without a session (needed to sign in / out). */
export const PUBLIC_ENDPOINTS = ['GET /api/auth/login', 'POST /api/auth/logout', `GET ${CALLBACK_PATH}`];

/**
 * Builds the Express app.
 * Security model (deny by default):
 *   1. Sign-in: the backend signs users in with Microsoft 365 and issues its own session JWT (httpOnly cookie).
 *   2. Every other /api request must carry that valid JWT (401 otherwise), including unknown routes.
 *      Roles and active status come from the database on every request.
 *   3. Every route declares the permission it needs with authorize(...) (enforced by tests) → 403 otherwise.
 *
 * Options (for tests): `users` (database layer), `signIn` (Microsoft), `isConfigured`.
 */
export function createApp({ users = usersRepository, signIn, isConfigured } = {}) {
  const app = express();
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

  const authenticate = createAuthenticateJWT({ users });
  const authController = createAuthController({ users, ...(signIn && { signIn }), ...(isConfigured && { isConfigured }) });
  const routers = { '/auth': createProtectedAuthRouter(authController), '/users': createUsersRouter(users) };

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind the Vite dev proxy / production reverse proxy
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false });
  app.use('/api', limiter, originCheck(allowedOrigins));

  // --- Public: sign-in round trip ---
  app.get(CALLBACK_PATH, limiter, asyncHandler(authController.callback));
  app.use('/api/auth', createPublicAuthRouter(authController));

  // --- Protected: everything else under /api ---
  const api = Router();
  api.use(authenticate); // runs before every route below, including unknown routes

  api.get('/health', authorize(PERMISSIONS.SYSTEM_HEALTH), (req, res) => {
    res.json({ success: true, status: 'ok' });
  });

  for (const [path, router] of API_MODULES) api.use(path, routers[path] ?? router);

  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp();
