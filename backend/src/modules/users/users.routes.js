import { Router } from 'express';
import { z } from 'zod';
import { authorize } from '../../middleware/authorizePermission.js';
import { validate } from '../../middleware/validate.js';
import { PERMISSIONS as P, ROLES } from '../../config/permissions.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { idParam, paginationQuery } from '../../utils/schemas.js';
import * as usersRepository from './users.repository.js';

const roleEnum = z.enum(Object.values(ROLES));
const justification = z.string().trim().max(1000).optional();

/**
 * User and role management, mounted under /api/users.
 * Roles are managed here (not in Microsoft Entra). Viewing: users:read (SASD, IT). Changing: users:manage (IT).
 */
export function createUsersRouter(users = usersRepository) {
  const router = Router();

  const notFound = () => ApiError.notFound('User not found');
  const ruleError = (err) => (err instanceof usersRepository.UserRuleError ? new ApiError(409, err.message) : err);

  // GET /api/users?search=&role=Organizer|none&accountType=staff&page=&pageSize=
  router.get(
    '/',
    authorize(P.USERS_READ),
    validate({
      query: paginationQuery.extend({
        role: z.union([roleEnum, z.literal('none')]).optional(),
        accountType: z.enum(['student', 'staff']).optional(),
      }),
    }),
    asyncHandler(async (req, res) => {
      res.json({ success: true, data: await users.listUsers(req.validated.query) });
    }),
  );

  // GET /api/users/:id
  router.get(
    '/:id',
    authorize(P.USERS_READ),
    validate({ params: idParam }),
    asyncHandler(async (req, res) => {
      const user = await users.findById(req.validated.params.id);
      if (!user) throw notFound();
      res.json({ success: true, data: user });
    }),
  );

  // PUT /api/users/:id/roles  { roles: ["Organizer"], justification? }  (replaces all roles)
  router.put(
    '/:id/roles',
    authorize(P.USERS_MANAGE),
    validate({ params: idParam, body: z.object({ roles: z.array(roleEnum).max(4), justification }) }),
    asyncHandler(async (req, res) => {
      try {
        const user = await users.setRoles({
          userId: req.validated.params.id,
          roles: req.validated.body.roles,
          justification: req.validated.body.justification ?? null,
          actorId: req.user.id,
          ipAddress: req.ip,
        });
        if (!user) throw notFound();
        res.json({ success: true, data: user });
      } catch (err) {
        throw ruleError(err);
      }
    }),
  );

  // PATCH /api/users/:id/status  { isActive: false, justification? }
  router.patch(
    '/:id/status',
    authorize(P.USERS_MANAGE),
    validate({ params: idParam, body: z.object({ isActive: z.boolean(), justification }) }),
    asyncHandler(async (req, res) => {
      if (req.validated.params.id === req.user.id && !req.validated.body.isActive) {
        throw new ApiError(409, 'You cannot deactivate your own account.');
      }
      try {
        const user = await users.setActive({
          userId: req.validated.params.id,
          isActive: req.validated.body.isActive,
          justification: req.validated.body.justification ?? null,
          actorId: req.user.id,
          ipAddress: req.ip,
        });
        if (!user) throw notFound();
        res.json({ success: true, data: user });
      } catch (err) {
        throw ruleError(err);
      }
    }),
  );

  return router;
}

export default createUsersRouter();
