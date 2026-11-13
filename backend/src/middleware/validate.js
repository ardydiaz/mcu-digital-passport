import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validates request parts against zod schemas.
 * Usage: validate({ body: createActivitySchema, params: idParamSchema })
 * Parsed results are stored on req.validated.
 */
export const validate = (schemas) => (req, res, next) => {
  req.validated = {};
  for (const key of ['body', 'params', 'query']) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key]);
    if (!result.success) {
      return next(ApiError.badRequest('Validation failed', z.flattenError(result.error)));
    }
    req.validated[key] = result.data;
  }
  next();
};
