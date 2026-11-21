import { env } from './environment.js';

const list = (value) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const allowedTenantIds = list(env.ENTRA_ALLOWED_TENANT_IDS ?? env.ENTRA_TENANT_ID);

const isPlaceholder = (value) => !value || value.startsWith('your-');

// Microsoft Entra ID settings for backend sign-in (authorization code flow with PKCE + client secret)
export const entraConfig = {
  tenantId: env.ENTRA_TENANT_ID,
  clientId: env.ENTRA_CLIENT_ID,
  clientSecret: env.ENTRA_CLIENT_SECRET,
  redirectUri: env.ENTRA_REDIRECT_URI,
  allowedTenantIds,
  // One tenant: sign in against it directly. Several tenants: "organizations", then check the tenant id.
  authority: `https://login.microsoftonline.com/${allowedTenantIds.length > 1 ? 'organizations' : env.ENTRA_TENANT_ID}`,
  scopes: ['openid', 'profile', 'email'],
  isConfigured: !isPlaceholder(env.ENTRA_TENANT_ID) && !isPlaceholder(env.ENTRA_CLIENT_ID) && !isPlaceholder(env.ENTRA_CLIENT_SECRET),
};

// MCU account domains, e.g. student.mcu.edu.ph (students) and mcu.edu.ph (faculty and staff)
export const accountDomains = {
  allowed: list(env.ALLOWED_EMAIL_DOMAINS),
  student: env.STUDENT_EMAIL_DOMAIN.trim().toLowerCase(),
};

// The app's own session (issued by the backend after Microsoft sign-in)
export const sessionConfig = {
  cookieName: 'mcu_session',
  transactionCookieName: 'mcu_auth_tx', // short-lived: state + PKCE verifier during the Microsoft round trip
  issuer: 'mcu-digital-passport',
  audience: 'mcu-digital-passport-api',
  ttlSeconds: Math.round(env.SESSION_TTL_HOURS * 3600),
  secure: env.NODE_ENV === 'production',
};
