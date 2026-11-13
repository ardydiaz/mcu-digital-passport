import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Blurred backdrop + centered panel. Closes on Escape and on backdrop click.
 * Base for Modal and other custom dialogs. `className` styles the panel.
 */
export default function Overlay({ open, onClose, labelledBy, dark = false, className = '', children }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    const previousOverflow = document.body.style.overflow;

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${dark ? 'bg-royal-950/85' : 'bg-royal-950/75'}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={labelledBy} className={`animate-pop ${className}`}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
