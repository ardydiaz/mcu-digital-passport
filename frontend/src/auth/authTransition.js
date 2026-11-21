import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * Sign-in / sign-out transition screens.
 * Signing in and out leaves the app (Microsoft pages), so we remember what is in progress in sessionStorage
 * and show the matching screen when the app loads again:
 *   'signing-in'  -> after a successful sign-in: "Welcome back, <name>!"
 *   'signed-out'  -> after returning from sign-out: "You've been signed out"
 */
const KEY = 'mcu-auth-transition';

export const WELCOME_MS = 1500;
export const SIGNED_OUT_MS = 1700;
export const MIN_SIGNING_OUT_MS = 700;

export function markPending(kind) {
  try {
    sessionStorage.setItem(KEY, kind);
  } catch {
    /* storage blocked: no transition screen, everything else still works */
  }
}

/** Returns (and forgets) the pending transition, if any. */
export function takePending() {
  try {
    const value = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * State for the full-screen transition overlay.
 * show(variant)            -> stays until replaced (e.g. 'signing-out' before leaving the page)
 * show(variant, duration)  -> fades out by itself after `duration` ms
 */
export function useAuthTransition() {
  const [state, setState] = useState({ variant: null, leaving: false });
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const show = useCallback((variant, duration) => {
    clearTimers();
    setState({ variant, leaving: false });
    if (duration) {
      timers.current.push(setTimeout(() => setState((s) => ({ ...s, leaving: true })), duration));
      timers.current.push(setTimeout(() => setState({ variant: null, leaving: false }), duration + 300));
    }
  }, []);

  useEffect(() => clearTimers, []);

  return { ...state, show };
}

export const firstName = (name) => name?.trim().split(/\s+/)[0];
