import { Award, Lock, Trophy } from 'lucide-react';
import PageHeader from '../../components/navigation/PageHeader';
import ListItemCard from '../../components/cards/ListItemCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { mockAchievements } from '../data/mockData';

export default function MyAchievements() {
  const achievements = mockAchievements;
  const earnedCount = achievements.filter((a) => a.earnedAt).length;

  return (
    <>
      <PageHeader
        icon={Trophy}
        title="My Achievements"
        subtitle={`${earnedCount} of ${achievements.length} badges earned`}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {achievements.map((achievement) => {
          const earned = Boolean(achievement.earnedAt);
          return (
            <ListItemCard
              key={achievement.id}
              icon={earned ? Award : Lock}
              iconTone={earned && achievement.tier === 'gold' ? 'royal' : 'soft'}
              highlight={earned && achievement.tier === 'gold'}
              className={earned ? '' : 'opacity-60'}
              title={achievement.title}
              description={achievement.description}
              trailing={
                earned ? (
                  <StatusBadge tone="gold">{formatDate(achievement.earnedAt)}</StatusBadge>
                ) : (
                  <StatusBadge tone="neutral">Locked</StatusBadge>
                )
              }
            />
          );
        })}
      </div>
    </>
  );
}
