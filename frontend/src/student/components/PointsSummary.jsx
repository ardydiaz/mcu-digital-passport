import ProgressBar from '../../components/common/ProgressBar';
import StatTile from '../../components/cards/StatTile';

/** Points total, progress toward the period goal, and quick stats. */
export default function PointsSummary({ points, activitiesAttended, achievementsEarned }) {
  const percent = Math.min(100, Math.round((points.total / points.goal) * 100));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-royal-800">{points.periodLabel}</span>
          <span className="font-display font-extrabold text-gold-600">
            {points.total} / {points.goal} Points ({percent}%)
          </span>
        </div>
        <ProgressBar value={points.total} max={points.goal} size="lg" label="Semester points goal" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Total Points" value={points.total} />
        <StatTile label="Activities" value={activitiesAttended} />
        <StatTile label="Achievements" value={achievementsEarned} highlight />
      </div>
    </div>
  );
}
