import { Navigate, useLocation } from 'react-router-dom';

/** Admins use the same Microsoft 365 sign-in page as everyone else; their role decides where they land. */
export default function AdminLogin() {
  const location = useLocation();
  return <Navigate to="/" replace state={location.state ?? { from: { pathname: '/admin' } }} />;
}
