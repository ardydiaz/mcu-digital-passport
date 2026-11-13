import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DigitalPassContext } from '../hooks/useDigitalPass';
import useToast from '../../hooks/useToast';
import { generateMockPassToken } from '../data/mockData';
import FullscreenPassModal from './FullscreenPassModal';

/** Holds the student's QR pass token and the fullscreen-pass modal for the whole student area. */
export default function DigitalPassProvider({ student, children }) {
  const { showToast } = useToast();
  // TODO: fetch a signed, short-lived token from the backend instead of generating one locally
  const [token, setToken] = useState(generateMockPassToken);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const spinTimer = useRef();

  useEffect(() => () => clearTimeout(spinTimer.current), []);

  const refreshToken = useCallback(() => {
    const next = generateMockPassToken();
    setToken(next);
    setIsRefreshing(true);
    clearTimeout(spinTimer.current);
    spinTimer.current = setTimeout(() => setIsRefreshing(false), 500);
    showToast(`Security token refreshed: ${next}`);
  }, [showToast]);

  const openPass = useCallback(() => setIsOpen(true), []);
  const closePass = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ student, token, isRefreshing, refreshToken, openPass, closePass }),
    [student, token, isRefreshing, refreshToken, openPass, closePass],
  );

  return (
    <DigitalPassContext.Provider value={value}>
      {children}
      <FullscreenPassModal open={isOpen} onClose={closePass} />
    </DigitalPassContext.Provider>
  );
}
