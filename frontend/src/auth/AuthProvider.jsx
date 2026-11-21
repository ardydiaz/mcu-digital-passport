import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { describeAuthError } from './authService';
import { peekReturnTo, portalEntry } from './portalEntry';
import {
  MIN_SIGNING_OUT_MS,
  SIGNED_OUT_MS,
  WELCOME_MS,
  delay,
  firstName,
  markPending,
  takePending,
  useAuthTransition,
} from './authTransition';
import AuthStatusScreen from '../components/common/AuthStatusScreen';
import { API_BASE_URL, SESSION_EXPIRED_EVENT, apiClient } from '../services/apiClient';
import { API_ENDPOINTS } from '../services/apiEndpoints';
import { ACCOUNT_DOMAINS, ROLES } from '../utils/constants';

/**
 * Exposes { user, roles, isAuthenticated, isLoading, isCheckingSession, isDevMock, error, login, logout }.
 *
 * Sign-in is handled by the BACKEND (Microsoft 365, authorization code flow):
 *   login()  -> browser goes to /api/auth/login -> Microsoft -> /auth/callback (backend)
 *            -> backend sets an httpOnly session cookie and returns to the app
 *   on load  -> GET /api/auth/me tells us who is signed in (401 = signed out)
 *   logout() -> POST /api/auth/logout, then Microsoft sign-out
 *
 * Development only: setting VITE_DEV_MOCK_ROLE in .env.local replaces all of this with a mock sign-in,
 * so the UI can be tested without the backend. Remove that line to use real Microsoft 365 sign-in.
 */
const DEV_MOCK_ROLE = import.meta.env.DEV ? import.meta.env.VITE_DEV_MOCK_ROLE : undefined;

export default function AuthProvider({ children }) {
  return DEV_MOCK_ROLE ? <DevAuthProvider>{children}</DevAuthProvider> : <BackendAuthProvider>{children}</BackendAuthProvider>;
}

/** Sends the browser to the backend sign-in endpoint. */
function goToSignIn({ returnTo, sso = false, loginHint } = {}) {
  const params = new URLSearchParams();
  const target = returnTo ?? peekReturnTo();
  if (target && target !== '/') params.set('returnTo', target);
  if (sso) params.set('sso', '1');
  if (loginHint) params.set('login_hint', loginHint);
  const query = params.toString();
  markPending('signing-in'); // show "Welcome back" when we return signed in
  window.location.assign(`${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGIN}${query ? `?${query}` : ''}`);
}

/** The transition overlay (welcome / signing out / signed out), on top of the app. */
function TransitionOverlay({ transition, user }) {
  if (!transition.variant) return null;
  return <AuthStatusScreen overlay variant={transition.variant} name={firstName(user?.name)} leaving={transition.leaving} />;
}

/**
 * GET /api/auth/me, retrying briefly when the server is unreachable or restarting (network error, 502/503/504),
 * so a few seconds of downtime doesn't show an error. 401 (signed out) is returned immediately.
 */
async function fetchCurrentUser(signal, attempts = 4) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await apiClient(API_ENDPOINTS.AUTH_ME, { signal });
    } catch (err) {
      const temporary = !err.status || [502, 503, 504].includes(err.status);
      if (err.name === 'AbortError' || !temporary || attempt >= attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1))); // 0.5s, 1s, 2s
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    }
  }
}

/** User-facing message when GET /api/auth/me fails for a reason other than "signed out". */
function describeSessionCheckError(status) {
  if (status === 431) {
    return 'Your browser is sending too many cookies to this site (error 431). Clear this site’s cookies, or use a private window, and try again.';
  }
  if (status === 429) return 'Too many requests from your network (error 429). Please wait a few minutes and try again.';
  if (!status) return 'We could not reach the server. Please check your connection and try again.';
  return `The server could not complete the request (error ${status}). Please try again in a moment.`;
}

/* ---------- Real sign-in via the backend ---------- */

function BackendAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | ready | redirecting
  const [error, setError] = useState(() => describeAuthError(portalEntry.authError));
  const transition = useAuthTransition();
  const { show } = transition;

  // Who is signed in? (the httpOnly cookie is sent automatically)
  useEffect(() => {
    const controller = new AbortController();
    fetchCurrentUser(controller.signal)
      .then(({ data }) => {
        // Just came back from a successful Microsoft sign-in: "Welcome back, <name>!"
        if (takePending() === 'signing-in') show('welcome', WELCOME_MS);
        setUser(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        const pending = takePending();
        // Coming from the Student Portal: sign in automatically (single sign-on), no sign-in page.
        if (portalEntry.fromPortal && !portalEntry.authError) {
          setStatus('redirecting');
          goToSignIn({ sso: true, loginHint: portalEntry.loginHint });
          return;
        }
        // Just came back from signing out: "You've been signed out"
        if (pending === 'signed-out') show('signed-out', SIGNED_OUT_MS);
        if (err.status !== 401) setError(describeSessionCheckError(err.status));
        setStatus('ready');
      });
    return () => controller.abort();
  }, [show]);

  // Any API call returning 401 means the session expired.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(({ returnTo } = {}) => {
    setError(null);
    setStatus('redirecting');
    goToSignIn({ returnTo });
  }, []);

  const logout = useCallback(async () => {
    show('signing-out');
    let logoutUrl = '/';
    try {
      // Keep "Signing you out…" on screen long enough to read
      const [{ data }] = await Promise.all([apiClient(API_ENDPOINTS.AUTH_LOGOUT, { method: 'POST' }), delay(MIN_SIGNING_OUT_MS)]);
      logoutUrl = data.logoutUrl;
    } catch {
      /* the session cookie may already be gone: continue to the sign-in page */
    }
    markPending('signed-out'); // show "You've been signed out" when we come back
    // Also end the Microsoft session, so a shared computer isn't signed in automatically next time.
    window.location.assign(logoutUrl);
  }, [show]);

  const value = useMemo(
    () => ({
      user,
      roles: user?.roles ?? [],
      isAuthenticated: Boolean(user),
      isLoading: status !== 'ready',
      isCheckingSession: !user && (status === 'checking' || (status === 'redirecting' && portalEntry.fromPortal)),
      isDevMock: false,
      error,
      login,
      logout,
    }),
    [user, status, error, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <TransitionOverlay transition={transition} user={user} />
    </AuthContext.Provider>
  );
}

/* ---------- Development mock (VITE_DEV_MOCK_ROLE in .env.local) ---------- */

const DEV_SESSION_KEY = 'mcu-dev-session';

function readDevSession() {
  try {
    return JSON.parse(sessionStorage.getItem(DEV_SESSION_KEY));
  } catch {
    return null;
  }
}

function DevAuthProvider({ children }) {
  const [session, setSession] = useState(readDevSession);
  const [isLoading, setIsLoading] = useState(false);
  // Simulates portal single sign-on: ?from=portal signs in automatically.
  const [autoSignIn, setAutoSignIn] = useState(() => portalEntry.fromPortal && !readDevSession());
  const transition = useAuthTransition();
  const { show } = transition;

  const login = useCallback(async () => {
    setIsLoading(true);
    await delay(700); // feel like a real sign-in
    // Mock account in the matching MCU domain: students @student.mcu.edu.ph, staff @mcu.edu.ph
    const domain = DEV_MOCK_ROLE === ROLES.STUDENT ? ACCOUNT_DOMAINS.student : ACCOUNT_DOMAINS.staff;
    const next = { name: `Dev ${DEV_MOCK_ROLE}`, email: `dev.${DEV_MOCK_ROLE.toLowerCase()}@${domain}`, role: DEV_MOCK_ROLE };
    try {
      sessionStorage.setItem(DEV_SESSION_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: session lasts until refresh */
    }
    show('welcome', WELCOME_MS);
    setSession(next);
    setIsLoading(false);
  }, [show]);

  const logout = useCallback(async () => {
    show('signing-out');
    await delay(MIN_SIGNING_OUT_MS);
    try {
      sessionStorage.removeItem(DEV_SESSION_KEY);
    } catch {
      /* ignore */
    }
    setSession(null);
    show('signed-out', SIGNED_OUT_MS);
  }, [show]);

  useEffect(() => {
    if (!autoSignIn) return;
    login().finally(() => setAutoSignIn(false));
  }, [autoSignIn, login]);

  const value = useMemo(
    () => ({
      user: session ? { name: session.name, email: session.email } : null,
      roles: session ? [session.role] : [],
      isAuthenticated: Boolean(session),
      isLoading,
      isCheckingSession: autoSignIn && !session,
      isDevMock: true,
      devRole: DEV_MOCK_ROLE,
      error: null,
      login,
      logout,
    }),
    [session, isLoading, autoSignIn, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <TransitionOverlay transition={transition} user={value.user} />
    </AuthContext.Provider>
  );
}
