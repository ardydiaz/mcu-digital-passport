import { useMemo } from 'react';
import { AuthContext } from './AuthContext';

// Development only: set VITE_DEV_MOCK_ROLE (Student, Organizer or Admin) in .env.local
// to preview protected pages before Microsoft Entra sign-in is wired up.
// Ignored in production builds.
const DEV_MOCK_ROLE = import.meta.env.DEV ? import.meta.env.VITE_DEV_MOCK_ROLE : undefined;

// TODO: wire up MSAL (@azure/msal-react) and expose user, roles, login, logout, getAccessToken
export default function AuthProvider({ children }) {
  const value = useMemo(
    () =>
      DEV_MOCK_ROLE
        ? { user: { name: `Dev ${DEV_MOCK_ROLE}` }, roles: [DEV_MOCK_ROLE], isAuthenticated: true }
        : { user: null, roles: [], isAuthenticated: false },
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
