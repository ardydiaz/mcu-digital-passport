import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import PageHeader from '../../components/navigation/PageHeader';
import SectionDivider from '../../components/common/SectionDivider';
import useToast from '../../hooks/useToast';
import UpcomingActivities from '../components/UpcomingActivities';
import AttendanceHistory from '../components/AttendanceHistory';
import { mockAttendance, mockUpcomingActivities } from '../data/mockData';

export default function MyActivities() {
  const { showToast } = useToast();
  // TODO: load from and save registrations to the API
  const [upcoming, setUpcoming] = useState(mockUpcomingActivities);

  const toggleRegistration = (id) => {
    const activity = upcoming.find((a) => a.id === id);
    setUpcoming((list) => list.map((a) => (a.id === id ? { ...a, registered: !a.registered } : a)));
    showToast(activity.registered ? 'Registration cancelled.' : 'Registered! Added to your Digital Passport.');
  };

  return (
    <>
      <PageHeader icon={CalendarDays} title="My Activities" subtitle="Register for upcoming activities and review attended ones." />

      <SectionDivider>Upcoming</SectionDivider>
      <UpcomingActivities activities={upcoming} onToggleRegistration={toggleRegistration} />

      <SectionDivider>Attended</SectionDivider>
      <AttendanceHistory records={mockAttendance} />
    </>
  );
}
