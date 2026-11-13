import ListItemCard from '../../components/cards/ListItemCard';
import Button from '../../components/common/Button';
import { formatDateTime } from '../../utils/formatDate';

/** Upcoming activities with a register / registered toggle. */
export default function UpcomingActivities({ activities, onToggleRegistration }) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ListItemCard
          key={activity.id}
          eyebrow={`${formatDateTime(activity.startsAt)} • ${activity.venue}`}
          title={activity.title}
          description={`${activity.description} • ${activity.points} pts`}
          trailing={
            <Button
              size="sm"
              variant={activity.registered ? 'success' : 'gold'}
              onClick={() => onToggleRegistration(activity.id)}
            >
              {activity.registered ? '✓ Registered' : 'Register'}
            </Button>
          }
        />
      ))}
    </div>
  );
}
