import { Router } from 'express';
import { authorize } from '../../middleware/authorizePermission.js';
import { PERMISSIONS as P } from '../../config/permissions.js';
import { notImplemented } from '../../utils/notImplemented.js';

// Mounted under /api/imports (SASD and IT): bulk imports, e.g. enrolled students from the Student Portal
const router = Router();

router.post('/students', authorize(P.IMPORTS_RUN), notImplemented);

export default router;
