import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ToastContext } from '../../hooks/useToast';
import IconTile from './IconTile';

const DURATION_MS = 3200;

export default function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef();

  const showToast = useCallback((text) => {
    setMessage(text);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-20 right-4 z-[60] transition-all duration-300 md:bottom-6 md:right-6 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
      >
        <div className="flex max-w-sm items-center gap-3 rounded-2xl border-2 border-gold-400 bg-royal-900 px-4 py-3 text-white shadow-2xl">
          <IconTile icon={ShieldCheck} tone="goldGlass" size="xs" />
          <p className="text-xs font-medium text-purple-50 sm:text-sm">{message}</p>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
