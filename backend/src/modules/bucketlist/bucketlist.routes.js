import { Router } from 'express';
import { z } from 'zod';
import { authorize } from '../../middleware/authorizePermission.js';
import { validate } from '../../middleware/validate.js';
import { PERMISSIONS as P } from '../../config/permissions.js';
import { idParam } from '../../utils/schemas.js';
import { notImplemented } from '../../utils/notImplemented.js';

// Mounted under /api/bucket-list
const router = Router();

const experienceBody = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(2000).optional(),
  requiredCount: z.number().int().min(1).max(100).default(1),
  isActive: z.boolean().default(true),
});

// Everyone who can see the bucket list: the pre-identified experiences
router.get('/', authorize(P.BUCKETLIST_READ), notImplemented);

// Student: own progress (completed / remaining / percentage)
router.get('/me', authorize(P.BUCKETLIST_READ_OWN), notImplemented);

// SASD: manage experiences
router.post('/', authorize(P.BUCKETLIST_MANAGE), validate({ body: experienceBody }), notImplemented);
router.patch(
  '/:id',
  authorize(P.BUCKETLIST_MANAGE),
  validate({ params: idParam, body: experienceBody.partial() }),
  notImplemented,
);
router.delete('/:id', authorize(P.BUCKETLIST_MANAGE), validate({ params: idParam }), notImplemented);

export default router;
