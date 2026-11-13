import { Outlet } from 'react-router-dom';
import { ClipboardList, House, ScanLine, CalendarDays } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { APP_BRAND } from '../../utils/constants';

export const ORGANIZER_NAV = [
  { to: '/organizer', label: 'Dashboard', shortLabel: 'Home', icon: House, end: true },
  { to: '/organizer/activities', label: 'My Activities', shortLabel: 'Activities', icon: CalendarDays },
  { to: '/organizer/scan', label: 'Scan Attendance', shortLabel: 'Scan', icon: ScanLine },
  { to: '/organizer/attendance', label: 'Attendance Records', shortLabel: 'Records', icon: ClipboardList },
];

export default function OrganizerLayout() {
  return (
    <AppShell
      brand={{ eyebrow: APP_BRAND.institution, title: APP_BRAND.productName }}
      navItems={ORGANIZER_NAV}
      title="Organizer Portal"
      subtitle="Manage activities and record student attendance"
    >
      <Outlet />
    </AppShell>
  );
}
