import { Router } from 'express';
import { z } from 'zod';
import { authorize } from '../../middleware/authorizePermission.js';
import { validate } from '../../middleware/validate.js';
import { PERMISSIONS as P } from '../../config/permissions.js';
import { dateString } from '../../utils/schemas.js';
import { notImplemented } from '../../utils/notImplemented.js';

// Mounted under /api/reports (SASD)
const router = Router();

// Participation report as Excel or CSV, filterable by student, college, program, activity and date
router.get(
  '/participation',
  authorize(P.REPORTS_GENERATE),
  validate({
    query: z.object({
      format: z.enum(['xlsx', 'csv']).default('xlsx'),
      studentId: z.string().trim().max(30).optional(),
      college: z.string().trim().max(100).optional(),
      program: z.string().trim().max(100).optional(),
      activityId: z.coerce.number().int().positive().optional(),
      from: dateString.optional(),
      to: dateString.optional(),
    }),
  }),
  notImplemented,
);

export default router;
