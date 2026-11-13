import { RefreshCw } from 'lucide-react';
import GoldFrame from '../../components/common/GoldFrame';
import QRCode from '../../components/common/QRCode';
import Button from '../../components/common/Button';
import useDigitalPass from '../hooks/useDigitalPass';
import { formatMonthYear } from '../../utils/formatDate';

/** Large live pass: name, ID, big QR, token and a refresh button. Used in the fullscreen modal and on My QR. */
export default function DigitalPassPanel({ titleId, className = '' }) {
  const { student, token, isRefreshing, refreshToken } = useDigitalPass();
  const validUntil = formatMonthYear(student.validUntil);

  return (
    <div
      className={`relative w-full max-w-sm rounded-3xl border-2 border-gold-400 bg-gradient-to-b from-royal-800 to-royal-950 p-6 text-center text-white shadow-2xl ${className}`}
    >
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold-300/50 bg-gold-400/20 px-3 py-1 text-xs font-bold text-gold-200">
        <span className="h-2 w-2 animate-ping rounded-full bg-gold-400" aria-hidden="true" /> LIVE VERIFICATION PASS
      </div>

      <h3 id={titleId} className="font-display text-xl font-extrabold uppercase tracking-wide">
        {student.fullName}
      </h3>
      <p className="mb-5 mt-0.5 font-mono text-xs uppercase text-gold-300">
        ID: {student.studentNumber} • {student.yearLevel}
      </p>

      <GoldFrame className="mx-auto p-3.5 shadow-2xl">
        <QRCode value={token} className="h-52 w-52" />
      </GoldFrame>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-center gap-2 font-mono text-xs text-purple-200">
          <span>TOKEN:</span>
          <span className="font-bold text-gold-300">{token}</span>
        </div>
        <p className="text-[11px] text-purple-200/80">
          Present this code to activity organizers for attendance scanning. Valid until{' '}
          <strong className="text-white">{validUntil}</strong>.
        </p>
      </div>

      <Button
        size="lg"
        fullWidth
        className="mt-5"
        icon={RefreshCw}
        iconClassName={isRefreshing ? 'animate-spin' : ''}
        onClick={refreshToken}
      >
        Generate New Security Token
      </Button>
    </div>
  );
}
