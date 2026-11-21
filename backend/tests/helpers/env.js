// Test environment. Imported FIRST by test files, before any src/ module reads process.env.
process.env.NODE_ENV = 'test';
process.env.DB_USER ??= 'test';
process.env.DB_NAME ??= 'test';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.ENTRA_TENANT_ID = '11111111-1111-1111-1111-111111111111';
process.env.ENTRA_CLIENT_ID = 'test-client-id';
process.env.ENTRA_CLIENT_SECRET = 'test-client-secret';
process.env.ENTRA_REDIRECT_URI = 'http://localhost:5173/auth/callback';
delete process.env.ENTRA_ALLOWED_TENANT_IDS;
process.env.ALLOWED_EMAIL_DOMAINS = 'student.mcu.edu.ph,mcu.edu.ph';
process.env.STUDENT_EMAIL_DOMAIN = 'student.mcu.edu.ph';
process.env.SESSION_JWT_SECRET = 'test-session-secret-that-is-at-least-32-characters-long';
