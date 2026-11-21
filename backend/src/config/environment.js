import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // Where users land after signing in / out. Defaults to the first CORS_ORIGIN.
  FRONTEND_URL: z.url().optional(),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string(),
  DB_CONNECTION_LIMIT: z.coerce.number().default(10),

  // Microsoft Entra ID app registration (Web platform, confidential client)
  ENTRA_TENANT_ID: z.string(),
  ENTRA_CLIENT_ID: z.string(),
  // The client secret VALUE (not the "Secret ID"). ENTRA_SECRET_ID is accepted as an alias.
  ENTRA_CLIENT_SECRET: z.string().optional(),
  ENTRA_SECRET_ID: z.string().optional(),
  // Must exactly match a redirect URI registered in Entra, e.g. http://localhost:5173/auth/callback
  ENTRA_REDIRECT_URI: z.url(),
  // Tenants allowed to sign in. Defaults to ENTRA_TENANT_ID. List both when students
  // (@student.mcu.edu.ph) and staff (@mcu.edu.ph) are in separate Microsoft 365 tenants.
  ENTRA_ALLOWED_TENANT_IDS: z.string().optional(),
  // Not used by backend sign-in (kept for compatibility with older .env files)
  ENTRA_API_AUDIENCE: z.string().optional(),

  // Only these email domains may use the system
  ALLOWED_EMAIL_DOMAINS: z.string().default('student.mcu.edu.ph,mcu.edu.ph'),
  // Accounts from this domain are Students by default (no app role needed)
  STUDENT_EMAIL_DOMAIN: z.string().default('student.mcu.edu.ph'),

  // Signs the app's own session JWT (httpOnly cookie). Long random string, keep secret.
  SESSION_JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
  SESSION_TTL_HOURS: z.coerce.number().positive().max(24).default(8),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.flattenError(parsed.error).fieldErrors);
  process.exit(1);
}

const data = parsed.data;

export const env = {
  ...data,
  ENTRA_CLIENT_SECRET: data.ENTRA_CLIENT_SECRET ?? data.ENTRA_SECRET_ID,
  FRONTEND_URL: (data.FRONTEND_URL ?? data.CORS_ORIGIN.split(',')[0].trim()).replace(/\/$/, ''),
};
