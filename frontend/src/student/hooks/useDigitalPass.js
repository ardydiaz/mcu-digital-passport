import { createContext, useContext } from 'react';

export const DigitalPassContext = createContext(null);

/**
 * Access the student's digital pass anywhere under StudentLayout:
 * { student, token, isRefreshing, refreshToken, openPass, closePass }
 */
export default function useDigitalPass() {
  const ctx = useContext(DigitalPassContext);
  if (!ctx) throw new Error('useDigitalPass must be used within DigitalPassProvider');
  return ctx;
}
