import { Router } from 'express';
import { z } from 'zod';
import { authorize } from '../../middleware/authorizePermission.js';
import { validate } from '../../middleware/validate.js';
import { PERMISSIONS as P } from '../../config/permissions.js';
import { idParam, paginationQuery } from '../../utils/schemas.js';
import { notImplemented } from '../../utils/notImplemented.js';

// Mounted under /api/attendance
const router = Router();

const justification = z.string().trim().min(10, 'Please give a justification of at least 10 characters').max(1000);

// Organizer: scan a student's QR token at an activity (duplicate scans are rejected in the service)
router.post(
  '/scan',
  authorize(P.ATTENDANCE_SCAN),
  validate({ body: z.object({ activityId: z.number().int().positive(), qrToken: z.string().trim().min(8).max(2048) }) }),
  notImplemented,
);

// Student: own verified activity history
router.get('/me', authorize(P.ATTENDANCE_READ_OWN), notImplemented);

// Organizer / SASD: attendance records, filterable by activity
router.get(
  '/',
  authorize(P.ATTENDANCE_READ),
  validate({ query: paginationQuery.extend({ activityId: z.coerce.number().int().positive().optional() }) }),
  notImplemented,
);

// Organizer / SASD: confirm participation before crediting
router.post('/:id/validate', authorize(P.ATTENDANCE_VALIDATE), validate({ params: idParam }), notImplemented);

// SASD: manual credit, correction or invalidation, always with a documented justification (audited)
router.post(
  '/manual',
  authorize(P.ATTENDANCE_MANUAL),
  validate({
    body: z.object({
      studentId: z.string().trim().min(1).max(30),
      activityId: z.number().int().positive(),
      justification,
    }),
  }),
  notImplemented,
);
router.post(
  '/:id/invalidate',
  authorize(P.ATTENDANCE_MANUAL),
  validate({ params: idParam, body: z.object({ justification }) }),
  notImplemented,
);

export default router;
