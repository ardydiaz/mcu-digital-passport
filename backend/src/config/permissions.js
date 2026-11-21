/**
 * Role-Based Access Control (RBAC)
 *
 * Roles are managed in the system (user_roles table, read on every request). Routes never check roles directly:
 * they require PERMISSIONS, and this file is the single place that decides which role has which permission.
 *
 * Roles (from docs/system-requirements.md, section 3):
 *   Student    - own passport, QR code, bucket list, progress and activity history
 *   Organizer  - manage assigned activities, scan QR codes, validate attendance
 *   Admin      - SASD Administrator: manage the passport system, adjust records, generate reports
 *   ITAdmin    - IT Administrator: FULL ACCESS (every permission and every dashboard); manages users and roles
 */

export const ROLES = Object.freeze({
  STUDENT: 'Student',
  ORGANIZER: 'Organizer',
  ADMIN: 'Admin',
  IT_ADMIN: 'ITAdmin',
});

export const PERMISSIONS = Object.freeze({
  // Any signed-in user
  PROFILE_READ_OWN: 'profile:read:own',

  // Student's own records ("own" = always the signed-in user, never an id from the request)
  PASSPORT_READ_OWN: 'passport:read:own',
  QR_GENERATE_OWN: 'qr:generate:own',
  BUCKETLIST_READ_OWN: 'bucketlist:read:own',
  ATTENDANCE_READ_OWN: 'attendance:read:own',
  NOTIFICATIONS_READ_OWN: 'notifications:read:own',

  // Activities
  ACTIVITIES_READ: 'activities:read',
  ACTIVITIES_CREATE: 'activities:create',
  ACTIVITIES_UPDATE: 'activities:update',
  ACTIVITIES_DELETE: 'activities:delete',

  // Attendance
  ATTENDANCE_SCAN: 'attendance:scan',
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_VALIDATE: 'attendance:validate',
  ATTENDANCE_MANUAL: 'attendance:manual', // manual credit / correct / invalidate, with justification

  // Students, passports and the bucket list (institution-wide)
  STUDENTS_READ: 'students:read',
  PASSPORTS_READ: 'passports:read',
  BUCKETLIST_READ: 'bucketlist:read',
  BUCKETLIST_MANAGE: 'bucketlist:manage',

  // Reports, imports and audit
  REPORTS_GENERATE: 'reports:generate',
  IMPORTS_RUN: 'imports:run',
  AUDIT_READ: 'audit:read',

  // System administration
  USERS_READ: 'users:read',
  USERS_MANAGE: 'users:manage',
  SETTINGS_MANAGE: 'settings:manage',

  // Health check (still requires a token)
  SYSTEM_HEALTH: 'system:health',
});

const P = PERMISSIONS;

const EVERYONE = [P.PROFILE_READ_OWN, P.SYSTEM_HEALTH];

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.STUDENT]: [
    ...EVERYONE,
    P.PASSPORT_READ_OWN,
    P.QR_GENERATE_OWN,
    P.BUCKETLIST_READ_OWN,
    P.BUCKETLIST_READ,
    P.ATTENDANCE_READ_OWN,
    P.NOTIFICATIONS_READ_OWN,
    P.ACTIVITIES_READ,
  ],

  [ROLES.ORGANIZER]: [
    ...EVERYONE,
    P.ACTIVITIES_READ,
    P.ACTIVITIES_CREATE,
    P.ACTIVITIES_UPDATE, // limited to their assigned activities in the service layer
    P.ATTENDANCE_SCAN,
    P.ATTENDANCE_READ,
    P.ATTENDANCE_VALIDATE,
    P.BUCKETLIST_READ,
  ],

  [ROLES.ADMIN]: [
    ...EVERYONE,
    P.ACTIVITIES_READ,
    P.ACTIVITIES_CREATE,
    P.ACTIVITIES_UPDATE,
    P.ACTIVITIES_DELETE,
    P.ATTENDANCE_SCAN,
    P.ATTENDANCE_READ,
    P.ATTENDANCE_VALIDATE,
    P.ATTENDANCE_MANUAL,
    P.STUDENTS_READ,
    P.PASSPORTS_READ,
    P.BUCKETLIST_READ,
    P.BUCKETLIST_MANAGE,
    P.REPORTS_GENERATE,
    P.IMPORTS_RUN,
    P.AUDIT_READ,
    P.USERS_READ,
  ],

  // IT Administrator: full access to every dashboard and every API permission (system super-user)
  [ROLES.IT_ADMIN]: Object.values(P),
});

/**
 * Granted to EVERY signed-in MCU user, even with no role (e.g. staff not yet assigned Organizer/Admin),
 * so the app can load their profile and show the "No access yet" page instead of failing.
 */
export const BASE_PERMISSIONS = Object.freeze([P.PROFILE_READ_OWN]);

/** All permissions granted by a list of roles, plus the base permissions (unknown roles grant nothing extra). */
export function permissionsForRoles(roles = []) {
  return [...new Set([...BASE_PERMISSIONS, ...roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? [])])];
}
