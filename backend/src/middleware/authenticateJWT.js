import { jwtVerify } from 'jose';
import { JWKS, entraConfig } from '../config/entra.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Verifies the Microsoft Entra ID access token sent as "Authorization: Bearer <token>".
 * On success, attaches the token claims to req.user.
 */
export async function authenticateJWT(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing bearer token'));
  }

  try {
    const token = header.slice(7);
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: entraConfig.issuer,
      audience: entraConfig.audience,
    });

    req.user = {
      oid: payload.oid,
      email: payload.preferred_username ?? payload.email,
      name: payload.name,
      roles: payload.roles ?? [],
      claims: payload,
    };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
