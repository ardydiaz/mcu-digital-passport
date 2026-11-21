import { Navigate } from 'react-router-dom';
import { LogOut, ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';
import CrestBadge from '../../components/common/CrestBadge';
import useAuth from '../../auth/useAuth';
import { getHomePath } from '../../auth/authService';
import { APP_BRAND } from '../../utils/constants';

/**
 * Shown to a signed-in MCU account that has no Digital Passport role yet,
 * typically faculty/staff (@mcu.edu.ph) who haven't been assigned Organizer or Admin.
 */
export default function NoAccess() {
  const { isAuthenticated, roles, user, logout } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (roles.length) return <Navigate to={getHomePath(roles)} replace />;

  return (
    <div className="passport-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-purple-200/70 bg-white p-7 text-center shadow-2xl shadow-royal-900/10 sm:p-9">
        <div className="mx-auto w-fit">
          <CrestBadge size="xl" />
        </div>
        <span className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-royal-900">No access yet</h1>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
          You&apos;re signed in as <span className="font-semibold text-royal-800">{user?.email}</span>, but this account
          hasn&apos;t been given a role in the {APP_BRAND.productName} yet.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          If you organize activities or manage the passport system, ask the SASD or ICT Office to assign you the{' '}
          <span className="font-semibold">Organizer</span> or <span className="font-semibold">Admin</span> role.
        </p>
        <Button variant="soft" icon={LogOut} fullWidth className="mt-7" onClick={logout}>
          Sign out and use another account
        </Button>
      </div>
    </div>
  );
}
