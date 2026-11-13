import { Outlet } from 'react-router-dom';
import { Bell, BookOpenCheck, CalendarDays, House, QrCode, Star, Trophy } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import SidebarInfoCard from '../../components/layout/SidebarInfoCard';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import useToast from '../../hooks/useToast';
import { APP_BRAND } from '../../utils/constants';
import DigitalPassProvider from '../components/DigitalPassProvider';
import useDigitalPass from '../hooks/useDigitalPass';
import { mockStudent } from '../data/mockData';

export const STUDENT_NAV = [
  { to: '/student', label: 'Home Overview', shortLabel: 'Home', icon: House, end: true },
  { to: '/student/passport', label: 'My Passport', shortLabel: 'Passport', icon: BookOpenCheck },
  { to: '/student/qr', label: 'My QR Pass', shortLabel: 'QR', icon: QrCode },
  { to: '/student/activities', label: 'My Activities', shortLabel: 'Activities', icon: CalendarDays },
  { to: '/student/achievements', label: 'My Achievements', shortLabel: 'Badges', icon: Trophy },
  { to: '/student/points', label: 'My Points', shortLabel: 'Points', icon: Star },
];

function StudentHeaderActions() {
  const { openPass } = useDigitalPass();
  const { showToast } = useToast();

  return (
    <>
      <Button size="sm" icon={QrCode} onClick={openPass}>
        <span className="hidden sm:inline">Quick ID Pass</span>
        <span className="sm:hidden">ID Pass</span>
      </Button>
      <button
        type="button"
        title="Notifications"
        aria-label="Notifications"
        onClick={() => showToast('Your passport records are up to date.')}
        className="relative rounded-xl border border-purple-200 bg-royal-50 p-2.5 text-royal-800 transition-colors hover:bg-royal-100"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold-500" />
      </button>
    </>
  );
}

export default function StudentLayout() {
  // TODO: load the signed-in student's profile from the API
  const student = mockStudent;

  return (
    <DigitalPassProvider student={student}>
      <AppShell
        brand={{ eyebrow: APP_BRAND.institution, title: APP_BRAND.productName }}
        navItems={STUDENT_NAV}
        title="Student Digital Passport"
        subtitle="Official Student Activity & Achievement Credential"
        headerActions={<StudentHeaderActions />}
        sidebarFooter={
          <SidebarInfoCard
            label="Credential Status"
            badge={
              <StatusBadge tone="goldGlass" dot>
                Verified
              </StatusBadge>
            }
          >
            Issued by the {APP_BRAND.institution} Office of Student Affairs.
          </SidebarInfoCard>
        }
      >
        <Outlet />
      </AppShell>
    </DigitalPassProvider>
  );
}
