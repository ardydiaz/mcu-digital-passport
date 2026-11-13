import { BookOpenCheck } from 'lucide-react';
import PageHeader from '../../components/navigation/PageHeader';
import SectionDivider from '../../components/common/SectionDivider';
import StatTile from '../../components/cards/StatTile';
import PassportCard from '../components/PassportCard';
import AttendanceHistory from '../components/AttendanceHistory';
import { mockAchievements, mockAttendance, mockPoints } from '../data/mockData';

export default function MyPassport() {
  const attendance = mockAttendance;
  const earned = mockAchievements.filter((a) => a.earnedAt).length;

  return (
    <>
      <PageHeader icon={BookOpenCheck} title="My Passport" subtitle="Your verified record of university activities." />
      <PassportCard />

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Stamps" value={attendance.length} />
        <StatTile label="Points" value={mockPoints.total} />
        <StatTile label="Achievements" value={earned} highlight />
      </div>

      <SectionDivider>Passport Stamps</SectionDivider>
      <AttendanceHistory records={attendance} />
    </>
  );
}
