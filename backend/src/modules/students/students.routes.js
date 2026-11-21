import { Router } from 'express';
import { z } from 'zod';
import { authorize } from '../../middleware/authorizePermission.js';
import { validate } from '../../middleware/validate.js';
import { PERMISSIONS as P } from '../../config/permissions.js';
import { paginationQuery } from '../../utils/schemas.js';
import { notImplemented } from '../../utils/notImplemented.js';

// Mounted under /api/students (SASD)
const router = Router();

router.get(
  '/',
  authorize(P.STUDENTS_READ),
  validate({
    query: paginationQuery.extend({
      college: z.string().trim().max(100).optional(),
      program: z.string().trim().max(100).optional(),
    }),
  }),
  notImplemented,
);
router.get(
  '/:studentId',
  authorize(P.STUDENTS_READ),
  validate({ params: z.object({ studentId: z.string().trim().min(1).max(30) }) }),
  notImplemented,
);

export default router;
