import { Star } from 'lucide-react';
import PageHeader from '../../components/navigation/PageHeader';
import SectionDivider from '../../components/common/SectionDivider';
import PointsSummary from '../components/PointsSummary';
import AttendanceHistory from '../components/AttendanceHistory';
import { mockAchievements, mockAttendance, mockPoints } from '../data/mockData';

export default function MyPoints() {
  return (
    <>
      <PageHeader icon={Star} title="My Points" subtitle="Points earned from attended activities." />
      <PointsSummary
        points={mockPoints}
        activitiesAttended={mockAttendance.length}
        achievementsEarned={mockAchievements.filter((a) => a.earnedAt).length}
      />

      <SectionDivider>Points History</SectionDivider>
      <AttendanceHistory records={mockAttendance} />
    </>
  );
}
