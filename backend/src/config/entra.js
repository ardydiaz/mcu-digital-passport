import { createRemoteJWKSet } from 'jose';
import { env } from './environment.js';

// Microsoft Entra ID (Azure AD) v2.0 endpoints
export const entraConfig = {
  tenantId: env.ENTRA_TENANT_ID,
  clientId: env.ENTRA_CLIENT_ID,
  audience: env.ENTRA_API_AUDIENCE,
  issuer: `https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/v2.0`,
  jwksUri: `https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/discovery/v2.0/keys`,
};

// Cached remote key set used to verify access-token signatures
export const JWKS = createRemoteJWKSet(new URL(entraConfig.jwksUri));
