import { Navigate, Outlet } from 'react-router-dom';
import useAuth from './useAuth';

/**
 * Allows access only if the signed-in user has at least one of allowedRoles.
 * Use inside a ProtectedRoute.
 */
export default function RoleGuard({ allowedRoles, redirectTo = '/' }) {
  const { roles } = useAuth();

  if (!roles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
}
