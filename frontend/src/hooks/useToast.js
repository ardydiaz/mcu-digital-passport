import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

/** const { showToast } = useToast(); showToast('Saved!'); */
export default function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
