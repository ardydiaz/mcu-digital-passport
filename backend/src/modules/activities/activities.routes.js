import { Router } from 'express';
import { z } from 'zod';
import { authorize } from '../../middleware/authorizePermission.js';
import { validate } from '../../middleware/validate.js';
import { PERMISSIONS as P } from '../../config/permissions.js';
import { idParam, paginationQuery } from '../../utils/schemas.js';
import { notImplemented } from '../../utils/notImplemented.js';

// Mounted under /api/activities
const router = Router();

const activityBody = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(5000).optional(),
  venue: z.string().trim().max(150).optional(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  bucketListItemId: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
});

router.get('/', authorize(P.ACTIVITIES_READ), validate({ query: paginationQuery }), notImplemented);
router.get('/:id', authorize(P.ACTIVITIES_READ), validate({ params: idParam }), notImplemented);

// Organizers and SASD. Organizers may only update their assigned activities (checked in the service).
router.post('/', authorize(P.ACTIVITIES_CREATE), validate({ body: activityBody }), notImplemented);
router.patch(
  '/:id',
  authorize(P.ACTIVITIES_UPDATE),
  validate({ params: idParam, body: activityBody.partial() }),
  notImplemented,
);
router.delete('/:id', authorize(P.ACTIVITIES_DELETE), validate({ params: idParam }), notImplemented);

export default router;
