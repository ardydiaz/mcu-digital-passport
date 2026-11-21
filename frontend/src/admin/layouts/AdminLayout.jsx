import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Settings, UserCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import SidebarInfoCard from '../../components/layout/SidebarInfoCard';
import StatusBadge from '../../components/common/StatusBadge';
import useAuth from '../../auth/useAuth';
import { APP_BRAND, ROLES } from '../../utils/constants';

export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/admin/profile', label: 'My Profile', shortLabel: 'Profile', icon: UserCircle },
  { to: '/admin/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { roles } = useAuth();
  const isItAdmin = roles.includes(ROLES.IT_ADMIN);

  return (
    <AppShell
      brand={{ eyebrow: APP_BRAND.institution, title: APP_BRAND.productName }}
      navItems={ADMIN_NAV}
      title="Administration"
      subtitle={isItAdmin ? 'IT Administrator · full access' : 'SASD Administrator'}
      sidebarFooter={
        <SidebarInfoCard
          label="Access level"
          badge={
            <StatusBadge tone="goldGlass" dot>
              {isItAdmin ? 'IT Admin' : 'SASD Admin'}
            </StatusBadge>
          }
        >
          {isItAdmin
            ? 'Full access to every dashboard and setting.'
            : 'Manage activities, records and reports.'}
        </SidebarInfoCard>
      }
    >
      <Outlet />
    </AppShell>
  );
}
