import { LogOut } from 'lucide-react';
import useAuth from '../../auth/useAuth';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import MobileBottomNav from './MobileBottomNav';
import DashboardSwitcher from '../navigation/DashboardSwitcher';

/**
 * Shared page frame for signed-in areas (student, organizer, admin):
 * desktop sidebar + sticky top bar + mobile bottom nav + centered content.
 *
 * brand:        { eyebrow, title, logoSrc? }
 * navItems:     [{ to, label, shortLabel?, icon, end? }]
 * sidebarFooter / headerActions: any node
 */
export default function AppShell({ brand, navItems, sidebarFooter, title, subtitle, headerActions, children }) {
  const { user, logout } = useAuth();

  // On mobile the sidebar is hidden, so the sign-out button sits in the top bar instead.
  const actions = (
    <>
      {headerActions}
      <button
        type="button"
        onClick={logout}
        title="Sign out"
        aria-label="Sign out"
        className="rounded-xl border border-purple-200 bg-royal-50 p-2.5 text-royal-800 transition-colors hover:bg-royal-100 md:hidden"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <div className="passport-bg flex min-h-screen flex-col pb-20 text-royal-950 selection:bg-gold-500 selection:text-royal-950 md:flex-row md:pb-0">
      <AppSidebar brand={brand} navItems={navItems} footer={sidebarFooter} user={user} onSignOut={logout} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-72">
        <AppTopbar title={title} subtitle={subtitle} actions={actions} logoSrc={brand.logoSrc} />
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-8">
          <DashboardSwitcher />
          {children}
        </main>
      </div>

      <MobileBottomNav navItems={navItems} />
    </div>
  );
}
