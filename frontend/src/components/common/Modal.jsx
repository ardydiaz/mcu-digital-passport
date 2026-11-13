import { useId } from 'react';
import { X } from 'lucide-react';
import Overlay from './Overlay';
import IconTile from './IconTile';
import Button from './Button';

/**
 * Royal-header modal with a white body.
 *
 * footer: omit for a default "Done" button, pass a node for custom actions, or null to hide.
 *
 * <Modal open={open} onClose={close} icon={Trophy} title="Achievements" subtitle="5 earned">
 *   ...
 * </Modal>
 */
export default function Modal({ open, onClose, title, subtitle, icon, footer, className = '', children }) {
  const titleId = useId();

  return (
    <Overlay
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className={`flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border-2 border-gold-400 bg-white text-royal-950 shadow-2xl ${className}`}
    >
      <div className="geo-banner flex items-center justify-between gap-3 border-b border-gold-400/40 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          {icon && <IconTile icon={icon} tone="glass" size="sm" />}
          <div>
            <h3 id={titleId} className="font-display text-base font-extrabold uppercase tracking-wide sm:text-lg">
              {title}
            </h3>
            {subtitle && <p className="text-xs font-medium text-gold-300">{subtitle}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-xl bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto bg-royal-50/40 p-6 text-sm">{children}</div>

      {footer !== null && (
        <div className="flex justify-end gap-3 border-t border-purple-100 bg-white px-6 py-3.5">
          {footer ?? (
            <Button variant="royal" size="sm" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      )}
    </Overlay>
  );
}
