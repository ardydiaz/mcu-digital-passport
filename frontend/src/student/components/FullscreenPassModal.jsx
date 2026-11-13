import { useId } from 'react';
import { X } from 'lucide-react';
import Overlay from '../../components/common/Overlay';
import DigitalPassPanel from './DigitalPassPanel';

export default function FullscreenPassModal({ open, onClose }) {
  const titleId = useId();

  return (
    <Overlay open={open} onClose={onClose} labelledBy={titleId} dark className="relative w-full max-w-sm">
      <DigitalPassPanel titleId={titleId} />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close pass"
        className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
    </Overlay>
  );
}
