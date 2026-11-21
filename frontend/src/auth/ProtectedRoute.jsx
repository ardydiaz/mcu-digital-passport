import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthStatusScreen from '../components/common/AuthStatusScreen';
import useAuth from './useAuth';

/**
 * Requires the user to be signed in. Role checks are handled by RoleGuard.
 * redirectTo: where signed-out users are sent (the sign-in page). They return here after signing in.
 */
export default function ProtectedRoute({ redirectTo = '/' }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && isLoading) {
    return <AuthStatusScreen variant="checking" />;
  }
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  return <Outlet />;
}
