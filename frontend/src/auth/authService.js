import { ACCOUNT_DOMAINS, ROLES } from '../utils/constants';

/*
 * Sign-in, the allowed MCU domains (@student.mcu.edu.ph, @mcu.edu.ph) and roles are all decided by the BACKEND.
 * The frontend only uses the roles it gets from GET /api/auth/me to choose which pages to show.
 */

/**
 * The dashboards (areas) of the app and who can open them.
 * The IT Administrator can open ALL of them (full access).
 */
export const DASHBOARDS = [
  { key: 'admin', label: 'Admin', to: '/admin', roles: [ROLES.ADMIN, ROLES.IT_ADMIN] },
  { key: 'organizer', label: 'Organizer', to: '/organizer', roles: [ROLES.ORGANIZER, ROLES.IT_ADMIN] },
  { key: 'student', label: 'Student', to: '/student', roles: [ROLES.STUDENT, ROLES.IT_ADMIN] },
];

export function getAccessibleDashboards(roles = []) {
  return DASHBOARDS.filter((d) => d.roles.some((role) => roles.includes(role)));
}

/** Where a user lands after signing in, based on their highest role. */
export function getHomePath(roles = []) {
  if (roles.includes(ROLES.ADMIN) || roles.includes(ROLES.IT_ADMIN)) return '/admin';
  if (roles.includes(ROLES.ORGANIZER)) return '/organizer';
  if (roles.includes(ROLES.STUDENT)) return '/student';
  return '/no-access';
}

export const WRONG_ACCOUNT_MESSAGE = `Please sign in with your MCU account (@${ACCOUNT_DOMAINS.student} or @${ACCOUNT_DOMAINS.staff}).`;

/** Messages for the ?auth_error=<code> the backend adds when sign-in fails. */
const AUTH_ERRORS = {
  wrong_account: WRONG_ACCOUNT_MESSAGE,
  cancelled: 'Sign-in was cancelled.',
  disabled: 'Your Digital Passport account has been deactivated. Please contact the SASD or ICT Office.',
  expired: 'Your sign-in took too long. Please try again.',
  not_configured: 'Microsoft 365 sign-in is not configured on the server yet. Please contact the ICT Office.',
  failed: 'We could not sign you in. Please try again.',
};

export function describeAuthError(code) {
  if (!code) return null;
  return AUTH_ERRORS[code] ?? AUTH_ERRORS.failed;
}
