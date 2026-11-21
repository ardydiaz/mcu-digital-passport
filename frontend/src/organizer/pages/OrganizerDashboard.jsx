import { CalendarDays, ClipboardList, House, ScanLine } from 'lucide-react';
import PageHeader from '../../components/navigation/PageHeader';
import FeatureCard from '../../components/cards/FeatureCard';

export default function OrganizerDashboard() {
  return (
    <>
      <PageHeader icon={House} title="Organizer Dashboard" subtitle="Manage your activities and record attendance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          to="/organizer/activities"
          icon={CalendarDays}
          title="My Activities"
          description="Activities assigned to you."
          actionLabel="View activities"
        />
        <FeatureCard
          to="/organizer/scan"
          icon={ScanLine}
          title="Scan Attendance"
          description="Scan student QR passes at your event."
          actionLabel="Start scanning"
        />
        <FeatureCard
          to="/organizer/attendance"
          icon={ClipboardList}
          title="Attendance Records"
          description="Review and validate recorded attendance."
          actionLabel="View records"
        />
      </div>
    </>
  );
}
