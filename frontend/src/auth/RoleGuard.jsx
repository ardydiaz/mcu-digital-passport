import { Navigate, Outlet } from 'react-router-dom';
import useAuth from './useAuth';
import { ROLES } from '../utils/constants';

/**
 * Allows access only if the signed-in user has at least one of allowedRoles.
 * The IT Administrator always has access (full access to every dashboard).
 * Use inside a ProtectedRoute.
 */
export default function RoleGuard({ allowedRoles, redirectTo = '/' }) {
  const { roles } = useAuth();

  if (!roles.includes(ROLES.IT_ADMIN) && !roles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
}
