/**
 * Single sign-on entry from the MCU Student Portal.
 *
 * The portal links to:  https://<passport-site>/?from=portal[&login_hint=<email>][&returnTo=/student/qr]
 *   from=portal   the student came from the portal: sign them in automatically, never show the sign-in page
 *   login_hint    (optional) the student's @mcu.edu.ph email, so Microsoft skips the account picker
 *   returnTo      (optional) page to open after sign-in, e.g. /student/qr (relative paths only)
 *
 * The values are read once, when the app loads, because the router removes the query string afterwards.
 */

const RETURN_TO_KEY = 'mcu-return-to';

/** Only same-site paths like "/student/qr": blocks open redirects such as "//evil.com" or "https://…". */
function safePath(value) {
  return typeof value === 'string' && /^\/(?!\/)[\w\-/]*$/.test(value) ? value : null;
}

function readOnce() {
  const params = new URLSearchParams(window.location.search);
  const entry = {
    fromPortal: params.get('from') === 'portal',
    loginHint: params.get('login_hint') || undefined,
    // Set by the backend when sign-in fails, e.g. ?auth_error=wrong_account
    authError: params.get('auth_error') || undefined,
  };

  const returnTo = safePath(params.get('returnTo'));
  if (returnTo) {
    try {
      // Kept in sessionStorage so it survives the round trip to Microsoft's sign-in page.
      sessionStorage.setItem(RETURN_TO_KEY, returnTo);
    } catch {
      /* storage blocked: the student lands on their dashboard instead */
    }
  }

  // Clean the address bar so a refresh or bookmark doesn't repeat the portal flow.
  const keys = ['from', 'login_hint', 'returnTo', 'auth_error'];
  if (keys.some((key) => params.has(key))) {
    keys.forEach((key) => params.delete(key));
    const query = params.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }

  return entry;
}

export const portalEntry = readOnce();

/** The page the portal asked to open after sign-in, if any. Safe to call during render. */
export function peekReturnTo() {
  try {
    return safePath(sessionStorage.getItem(RETURN_TO_KEY));
  } catch {
    return null;
  }
}

/** Forget the portal's requested page once the student has been sent there. */
export function clearReturnTo() {
  try {
    sessionStorage.removeItem(RETURN_TO_KEY);
  } catch {
    /* ignore */
  }
}
