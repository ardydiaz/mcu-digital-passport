import { Maximize2, RefreshCw, ScanLine } from 'lucide-react';
import GoldFrame from '../../components/common/GoldFrame';
import QRCode from '../../components/common/QRCode';
import Button from '../../components/common/Button';
import useDigitalPass from '../hooks/useDigitalPass';
import { formatMonthYear } from '../../utils/formatDate';

/** Holographic "Scan for verification" card with QR, token and pass controls. */
export default function VerificationCard() {
  const { student, token, isRefreshing, refreshToken, openPass } = useDigitalPass();

  return (
    <section className="holo-sheen rounded-3xl border-2 border-gold-400/70 bg-gradient-to-r from-royal-950 via-royal-900 to-royal-800 p-5 text-white shadow-xl sm:p-6">
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <button type="button" onClick={openPass} aria-label="Show fullscreen pass" className="shrink-0">
            <GoldFrame className="p-2.5">
              <QRCode value={token} className="h-24 w-24 sm:h-28 sm:w-28" />
            </GoldFrame>
          </button>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gold-300">
              <ScanLine className="h-4 w-4" aria-hidden="true" /> Official Verification
            </div>
            <h3 className="font-display text-xl font-extrabold tracking-wide sm:text-2xl">SCAN FOR VERIFICATION</h3>
            <p className="font-display text-sm font-bold tracking-wider text-gold-300">
              VALID UNTIL: {formatMonthYear(student.validUntil)}
            </p>
            <p className="max-w-md text-xs text-purple-200">
              Token ID: <span className="font-mono font-bold text-gold-200">{token}</span> • Rotates to prevent reuse.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap justify-center gap-2.5 sm:w-auto sm:flex-col">
          <Button size="lg" icon={Maximize2} onClick={openPass} className="flex-1 sm:flex-none">
            Show Fullscreen Pass
          </Button>
          <Button
            variant="glass"
            icon={RefreshCw}
            iconClassName={`text-gold-300 ${isRefreshing ? 'animate-spin' : ''}`}
            onClick={refreshToken}
            className="flex-1 sm:flex-none"
          >
            Refresh Dynamic QR
          </Button>
        </div>
      </div>
    </section>
  );
}
