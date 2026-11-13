import { Stamp } from 'lucide-react';
import ListItemCard from '../../components/cards/ListItemCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatDate';

/** List of attended activities (passport stamps) with points earned. */
export default function AttendanceHistory({ records, emptyMessage = 'No attended activities yet.' }) {
  if (!records.length) {
    return <p className="rounded-2xl border border-purple-200 bg-white p-6 text-center text-sm text-slate-600">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {records.map((record, index) => (
        <ListItemCard
          key={record.id}
          icon={Stamp}
          iconTone={index === 0 ? 'royal' : 'soft'}
          highlight={index === 0}
          eyebrow={formatDate(record.attendedAt)}
          title={record.activity}
          description={record.organizer}
          trailing={<StatusBadge tone="gold">+{record.points} pts</StatusBadge>}
        />
      ))}
    </div>
  );
}
