import { randomUUID } from 'node:crypto';
import { env } from '../../config/environment.js';
import { entraConfig, sessionConfig } from '../../config/entra.js';
import { issueSessionToken, signTransaction, verifySessionToken, verifyTransaction } from '../../utils/sessionToken.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';
import * as authService from './auth.service.js';
import * as usersRepository from '../users/users.repository.js';

const cookieBase = { httpOnly: true, sameSite: 'lax', secure: sessionConfig.secure, path: '/' };

/** Only same-site paths like "/student/qr": blocks open redirects such as "//evil.com". */
const safePath = (value) => (typeof value === 'string' && /^\/(?!\/)[\w\-/]*$/.test(value) ? value : null);

const toFrontend = (path = '/', params) => {
  const url = new URL(path, `${env.FRONTEND_URL}/`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
};

// Microsoft errors that just mean "no existing session": show the normal sign-in page, no error.
const NO_SESSION_ERRORS = new Set(['login_required', 'interaction_required', 'account_selection_required', 'consent_required']);

/**
 * Sign-in controllers. `signIn` (Microsoft) and `users` (database) are replaced by fakes in tests.
 */
export function createAuthController({
  signIn = authService.microsoftSignIn,
  users = usersRepository,
  isConfigured = () => entraConfig.isConfigured,
} = {}) {
  /**
   * GET /api/auth/login?returnTo=/student/qr&login_hint=juan@student.mcu.edu.ph&sso=1
   * Redirects the browser to Microsoft. sso=1 (from the Student Portal) reuses the existing Microsoft session
   * without showing the account picker.
   */
  async function login(req, res) {
    if (!isConfigured()) return res.redirect(toFrontend('/', { auth_error: 'not_configured' }));

    const state = randomUUID();
    const returnTo = safePath(req.query.returnTo);
    const loginHint = typeof req.query.login_hint === 'string' && req.query.login_hint.length <= 254 ? req.query.login_hint : undefined;
    const prompt = req.query.sso === '1' ? undefined : 'select_account';

    const { url, codeVerifier } = await signIn.getSignInUrl({ state, prompt, loginHint });

    res.cookie(sessionConfig.transactionCookieName, await signTransaction({ state, codeVerifier, returnTo }), {
      ...cookieBase,
      maxAge: 10 * 60 * 1000,
    });
    res.redirect(url);
  }

  /**
   * GET <ENTRA_REDIRECT_URI path> (e.g. /auth/callback)
   * Microsoft sends the user back here. Verifies state, redeems the code, checks the MCU account,
   * then issues the app's session JWT as an httpOnly cookie and returns to the frontend.
   */
  async function callback(req, res) {
    const txCookie = req.cookies?.[sessionConfig.transactionCookieName];
    res.clearCookie(sessionConfig.transactionCookieName, cookieBase);

    let tx;
    try {
      tx = await verifyTransaction(txCookie);
    } catch {
      return res.redirect(toFrontend('/', { auth_error: 'expired' }));
    }

    if (req.query.error) {
      if (NO_SESSION_ERRORS.has(req.query.error)) return res.redirect(toFrontend('/'));
      const reason = req.query.error === 'access_denied' ? 'cancelled' : 'failed';
      logger.warn(`Microsoft sign-in error: ${req.query.error}`);
      return res.redirect(toFrontend('/', { auth_error: reason }));
    }

    if (typeof req.query.code !== 'string' || req.query.state !== tx.state) {
      return res.redirect(toFrontend('/', { auth_error: 'failed' }));
    }

    try {
      const claims = await signIn.redeemCode({ code: req.query.code, codeVerifier: tx.codeVerifier });
      const { user, error } = authService.evaluateSignIn(claims);
      if (error) return res.redirect(toFrontend('/', { auth_error: error }));

      // Save the user in the database (create on first sign-in, update afterwards)
      const saved = await users.upsertOnSignIn({ ...user, ipAddress: req.ip });
      if (saved.disabled) return res.redirect(toFrontend('/', { auth_error: 'disabled' }));

      res.cookie(sessionConfig.cookieName, await issueSessionToken({ ...user, id: saved.id }), {
        ...cookieBase,
        maxAge: sessionConfig.ttlSeconds * 1000,
      });
      return res.redirect(toFrontend(tx.returnTo ?? '/'));
    } catch (err) {
      logger.error('Microsoft sign-in failed:', err.message);
      return res.redirect(toFrontend('/', { auth_error: 'failed' }));
    }
  }

  /**
   * POST /api/auth/logout: ends the app session and returns Microsoft's sign-out URL.
   * With a logout_hint, Microsoft signs out exactly the account that used the app (no account picker).
   */
  async function logout(req, res) {
    let loginHint;
    try {
      loginHint = (await verifySessionToken(req.cookies?.[sessionConfig.cookieName])).lh;
    } catch {
      /* no or expired session: sign out without a hint */
    }
    res.clearCookie(sessionConfig.cookieName, cookieBase);

    const url = new URL(`${entraConfig.authority}/oauth2/v2.0/logout`);
    url.searchParams.set('post_logout_redirect_uri', env.FRONTEND_URL);
    if (loginHint) url.searchParams.set('logout_hint', loginHint);
    res.json({ success: true, data: { logoutUrl: url.toString() } });
  }

  /** GET /api/auth/me (protected): the signed-in user's profile, roles and permissions. */
  async function me(req, res) {
    const profile = req.user.id ? await users.findProfile(req.user.id) : null;
    if (!profile) throw ApiError.unauthorized('Your account was not found. Please sign in again.');
    res.json({
      success: true,
      data: { ...profile, oid: req.user.oid, roles: req.user.roles, permissions: req.user.permissions },
    });
  }

  return { login, callback, logout, me };
}

export const authController = createAuthController();
