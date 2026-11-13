import { GraduationCap, MapPin, Maximize2, ShieldCheck } from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import GoldFrame from '../../components/common/GoldFrame';
import QRCode from '../../components/common/QRCode';
import StatusBadge from '../../components/common/StatusBadge';
import useDigitalPass from '../hooks/useDigitalPass';
import { formatMonthYear } from '../../utils/formatDate';

function MetaChip({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-royal-950/60 px-2.5 py-1 text-xs text-purple-100">
      <Icon className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" /> {children}
    </span>
  );
}

/** Royal purple identity hero: photo, ID, name, program and (on large screens) a mini QR seal. */
export default function PassportCard({ showSeal = true }) {
  const { student, token, openPass } = useDigitalPass();
  const validUntil = formatMonthYear(student.validUntil);

  return (
    <section className="geo-banner relative overflow-hidden rounded-3xl border-2 border-gold-400/50 p-5 text-white shadow-xl shadow-royal-900/15 sm:p-7">
      {/* Decorative geometric triangles */}
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-48 opacity-30" aria-hidden="true">
        <svg viewBox="0 0 200 240" className="h-full w-full" preserveAspectRatio="none">
          <polygon points="200,0 80,120 200,240" fill="#7C3AED" />
          <polygon points="200,110 120,190 200,240" fill="#D4AF37" />
          <polygon points="140,0 200,0 200,80" fill="#1A0533" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="flex shrink-0 flex-col items-center">
            <GoldFrame>
              <Avatar
                src={student.photoUrl}
                name={student.fullName}
                className="h-28 w-24 rounded-xl border border-gold-400/60 sm:h-32 sm:w-28"
              />
            </GoldFrame>
            <span className="mt-2.5 rounded-md border border-gold-300/50 bg-white/15 px-3 py-0.5 font-mono text-[11px] font-bold tracking-wider text-gold-200 backdrop-blur-sm">
              ID: {student.studentNumber}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <StatusBadge tone="goldGlass" icon={ShieldCheck} className="mb-1 px-3 text-xs">
              {student.status}
            </StatusBadge>
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
              {student.fullName}
            </h2>
            <p className="text-sm font-medium text-purple-100 sm:text-base">{student.college}</p>
            <p className="text-xs font-bold text-gold-300 sm:text-sm">
              PROGRAM: <span className="font-normal text-white">{student.program}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2 sm:justify-start">
              <MetaChip icon={MapPin}>{student.campus}</MetaChip>
              <MetaChip icon={GraduationCap}>{student.yearLevel}</MetaChip>
            </div>
          </div>
        </div>

        {showSeal && (
          <div className="hidden items-center gap-4 rounded-2xl border-2 border-gold-400 bg-white p-4 text-royal-950 shadow-lg lg:flex">
            <button
              type="button"
              onClick={openPass}
              aria-label="Enlarge QR pass"
              className="rounded-xl border border-purple-200 bg-royal-50 p-2 transition-transform hover:scale-105"
            >
              <QRCode value={token} className="h-20 w-20" />
            </button>
            <div className="space-y-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-gold-600">Digital Seal</span>
              <p className="font-display text-sm font-extrabold text-royal-900">VALID UNTIL: {validUntil}</p>
              <p className="text-xs text-slate-600">Tap QR to expand or refresh</p>
              <button
                type="button"
                onClick={openPass}
                className="mt-1 flex items-center gap-1 text-xs font-bold text-royal-700 transition-colors hover:text-gold-600"
              >
                Fullscreen Pass <Maximize2 className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
