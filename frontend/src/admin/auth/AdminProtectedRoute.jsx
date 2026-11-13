import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../auth/useAuth';
import { ROLES } from '../../utils/constants';

export default function AdminProtectedRoute() {
  const { isAuthenticated, roles } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (!roles.includes(ROLES.ADMIN)) {
    return <Navigate to="/admin/access-denied" replace />;
  }
  return <Outlet />;
}
