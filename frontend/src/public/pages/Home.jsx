import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../auth/useAuth';
import { getHomePath } from '../../auth/authService';
import { clearReturnTo, peekReturnTo } from '../../auth/portalEntry';
import LoginShowcase from '../components/login/LoginShowcase';
import SignInCard from '../components/login/SignInCard';
import AuthStatusScreen from '../../components/common/AuthStatusScreen';

/**
 * Landing page = Microsoft 365 sign-in.
 * - Already signed in (or signed in silently via single sign-on from the Student Portal): go to the dashboard.
 * - While checking for an existing Microsoft session: show a splash instead of flashing the sign-in page.
 */
export default function Home() {
  const { isAuthenticated, isCheckingSession, roles, login, isLoading, error, isDevMock, devRole } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) clearReturnTo();
  }, [isAuthenticated]);

  if (isAuthenticated) {
    const from = location.state?.from?.pathname;
    const target = (from && from !== '/' ? from : null) ?? peekReturnTo() ?? getHomePath(roles);
    return <Navigate to={target} replace />;
  }

  if (isCheckingSession) {
    return <AuthStatusScreen variant="checking" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-royal-50 lg:flex-row">
      <LoginShowcase />

      <section className="passport-bg relative flex flex-1 items-start justify-center px-4 pb-12 lg:items-center lg:px-10 lg:py-12">
        {/* On mobile the card overlaps the purple hero */}
        <div className="-mt-10 flex w-full justify-center lg:mt-0">
          <SignInCard
            onSignIn={() => login({ returnTo: location.state?.from?.pathname })}
            isLoading={isLoading}
            error={error}
            devRole={isDevMock ? devRole : null}
          />
        </div>
      </section>
    </div>
  );
}
