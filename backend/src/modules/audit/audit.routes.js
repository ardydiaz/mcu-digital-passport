import { Router } from 'express';
import { z } from 'zod';
import { authorize } from '../../middleware/authorizePermission.js';
import { validate } from '../../middleware/validate.js';
import { PERMISSIONS as P } from '../../config/permissions.js';
import { dateString, paginationQuery } from '../../utils/schemas.js';
import { notImplemented } from '../../utils/notImplemented.js';

// Mounted under /api/audit (SASD and IT): who changed what, when and why
const router = Router();

router.get(
  '/',
  authorize(P.AUDIT_READ),
  validate({
    query: paginationQuery.extend({
      action: z.string().trim().max(50).optional(),
      from: dateString.optional(),
      to: dateString.optional(),
    }),
  }),
  notImplemented,
);

export default router;
