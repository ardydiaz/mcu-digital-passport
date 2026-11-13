import { BookOpenCheck, CalendarCheck, CalendarDays, Star, Trophy } from 'lucide-react';
import FeatureCard from '../../components/cards/FeatureCard';
import ProgressBar from '../../components/common/ProgressBar';
import SectionDivider from '../../components/common/SectionDivider';
import StatusBadge from '../../components/common/StatusBadge';
import PassportCard from '../components/PassportCard';
import VerificationCard from '../components/VerificationCard';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { mockAchievements, mockAttendance, mockPoints, mockUpcomingActivities } from '../data/mockData';

export default function StudentDashboard() {
  // TODO: replace mock data with API calls
  const attendance = mockAttendance;
  const upcoming = mockUpcomingActivities.slice(0, 2);
  const earned = mockAchievements.filter((a) => a.earnedAt);
  const points = mockPoints;
  const pointsPercent = Math.round((points.total / points.goal) * 100);

  return (
    <>
      <PassportCard />

      <SectionDivider>My Digital Passport</SectionDivider>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <FeatureCard
          to="/student/passport"
          icon={BookOpenCheck}
          title="1. Passport Stamps"
          badge={<StatusBadge tone="success">Up-to-Date</StatusBadge>}
          actionLabel="View Passport"
        >
          <p className="text-sm font-semibold text-royal-800">{attendance.length} Stamps Collected</p>
          <p className="mt-1 text-xs text-slate-600">
            Last stamp: {attendance[0] ? formatDate(attendance[0].attendedAt) : '—'}
          </p>
        </FeatureCard>

        <FeatureCard
          to="/student/activities"
          icon={CalendarDays}
          title="2. Activities"
          badge={<StatusBadge tone="gold">{attendance.length} Attended</StatusBadge>}
          actionLabel="Explore Activities"
        >
          <p className="text-sm font-semibold text-royal-800">Seminars, Workshops & Events</p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">
            {attendance.slice(0, 3).map((a) => a.activity).join(' • ')}
          </p>
        </FeatureCard>

        <FeatureCard
          to="/student/achievements"
          icon={Trophy}
          title="3. Achievements"
          badge={<StatusBadge tone="royal">{earned.length} Earned</StatusBadge>}
          actionLabel="View Badges"
        >
          <p className="text-sm font-semibold text-royal-800">Latest: {earned.at(-1)?.title ?? '—'}</p>
          <p className="mt-1 text-xs text-slate-600">
            {mockAchievements.length - earned.length} more badge(s) to unlock
          </p>
        </FeatureCard>

        <FeatureCard
          to="/student/points"
          icon={Star}
          title="4. My Points"
          badge={<StatusBadge tone="gold">{pointsPercent}% of Goal</StatusBadge>}
          actionLabel="View Points"
        >
          <p className="text-sm font-semibold text-royal-800">{points.periodLabel}</p>
          <ProgressBar
            className="mt-2.5"
            value={points.total}
            max={points.goal}
            label="Semester Goal"
            valueLabel={`${points.total} / ${points.goal}`}
          />
        </FeatureCard>

        <FeatureCard
          to="/student/activities"
          icon={CalendarCheck}
          title="5. Upcoming Activities"
          description="Campus schedule & registrations"
          inlineHeader
          badge={<StatusBadge tone="royal">{mockUpcomingActivities.length} Upcoming</StatusBadge>}
          actionLabel="Manage Registrations"
          className="lg:col-span-2"
        >
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {upcoming.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-purple-200/80 bg-royal-50 p-3"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-extrabold uppercase text-gold-600">
                    {formatDateTime(activity.startsAt)}
                  </span>
                  <p className="truncate text-sm font-bold text-royal-950">{activity.title}</p>
                </div>
                <StatusBadge shape="tag" tone={activity.registered ? 'success' : 'neutral'}>
                  {activity.registered ? 'Going' : 'Open'}
                </StatusBadge>
              </div>
            ))}
          </div>
        </FeatureCard>
      </section>

      <VerificationCard />
    </>
  );
}
