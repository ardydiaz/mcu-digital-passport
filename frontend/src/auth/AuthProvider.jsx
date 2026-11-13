import { AuthContext } from './AuthContext';

// TODO: wire up MSAL (@azure/msal-react) and expose user, roles, login, logout, getAccessToken
export default function AuthProvider({ children }) {
  const value = { user: null, roles: [], isAuthenticated: false };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
