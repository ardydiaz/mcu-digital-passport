import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from './useAuth';

/**
 * Requires the user to be signed in. Role checks are handled by RoleGuard.
 * redirectTo: where unauthenticated users are sent (defaults to the public home page).
 */
export default function ProtectedRoute({ redirectTo = '/' }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  return <Outlet />;
}
