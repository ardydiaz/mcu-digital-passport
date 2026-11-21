// Must match the app role values defined in the Entra app registration
export const ROLES = {
  ADMIN: 'Admin', // SASD Administrator
  IT_ADMIN: 'ITAdmin', // IT Administrator
  ORGANIZER: 'Organizer',
  STUDENT: 'Student',
};

// Branding shown in the app shell (sidebar, top bar)
export const APP_BRAND = {
  institution: 'MCU',
  productName: 'Digital Passport',
  fullName: 'Manila Central University',
};

// MCU Microsoft 365 account domains. Only these can sign in.
// Students are Students automatically; staff need an app role (Organizer/Admin) assigned in Entra.
export const ACCOUNT_DOMAINS = {
  student: 'student.mcu.edu.ph',
  staff: 'mcu.edu.ph',
};
