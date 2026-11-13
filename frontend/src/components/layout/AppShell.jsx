import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import MobileBottomNav from './MobileBottomNav';

/**
 * Shared page frame for signed-in areas (student, organizer, admin):
 * desktop sidebar + sticky top bar + mobile bottom nav + centered content.
 *
 * brand:        { eyebrow, title, logoSrc? }
 * navItems:     [{ to, label, shortLabel?, icon, end? }]
 * sidebarFooter / headerActions: any node
 */
export default function AppShell({ brand, navItems, sidebarFooter, title, subtitle, headerActions, children }) {
  return (
    <div className="passport-bg flex min-h-screen flex-col pb-20 text-royal-950 selection:bg-gold-500 selection:text-royal-950 md:flex-row md:pb-0">
      <AppSidebar brand={brand} navItems={navItems} footer={sidebarFooter} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-72">
        <AppTopbar title={title} subtitle={subtitle} actions={headerActions} logoSrc={brand.logoSrc} />
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-8">{children}</main>
      </div>

      <MobileBottomNav navItems={navItems} />
    </div>
  );
}
