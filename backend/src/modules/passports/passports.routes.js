import { Router } from 'express';
import { z } from 'zod';
import { authorize } from '../../middleware/authorizePermission.js';
import { validate } from '../../middleware/validate.js';
import { PERMISSIONS as P } from '../../config/permissions.js';
import { notImplemented } from '../../utils/notImplemented.js';

// Mounted under /api/passports
const router = Router();

// Student: own digital passport (profile, stamps, progress). "me" always means the signed-in user.
router.get('/me', authorize(P.PASSPORT_READ_OWN), notImplemented);

// Student: new short-lived, server-signed QR token for attendance scanning
router.post('/me/qr-token', authorize(P.QR_GENERATE_OWN), notImplemented);

// Student: own notifications (credited experiences, milestones)
router.get('/me/notifications', authorize(P.NOTIFICATIONS_READ_OWN), notImplemented);

// SASD: any student's passport
router.get(
  '/:studentId',
  authorize(P.PASSPORTS_READ),
  validate({ params: z.object({ studentId: z.string().trim().min(1).max(30) }) }),
  notImplemented,
);

export default router;
