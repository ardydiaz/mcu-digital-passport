import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthStatusScreen from '../../components/common/AuthStatusScreen';
import useAuth from '../../auth/useAuth';
import { ROLES } from '../../utils/constants';

export default function AdminProtectedRoute() {
  const { isAuthenticated, isLoading, roles } = useAuth();
  const location = useLocation();

  if (!isAuthenticated && isLoading) {
    return <AuthStatusScreen variant="checking" />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (!roles.includes(ROLES.ADMIN) && !roles.includes(ROLES.IT_ADMIN)) {
    return <Navigate to="/admin/access-denied" replace />;
  }
  return <Outlet />;
}
