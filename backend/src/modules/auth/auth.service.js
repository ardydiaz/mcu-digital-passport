import { ConfidentialClientApplication, CryptoProvider } from '@azure/msal-node';
import { accountDomains, entraConfig } from '../../config/entra.js';
import { getEmailDomain } from '../../utils/accountDomain.js';

const crypto = new CryptoProvider();
let client;

/** The Microsoft sign-in client, created on first use (so the API can start before Entra is configured). */
function getClient() {
  client ??= new ConfidentialClientApplication({
    auth: {
      clientId: entraConfig.clientId,
      authority: entraConfig.authority,
      clientSecret: entraConfig.clientSecret,
    },
  });
  return client;
}

/** Real Microsoft implementation. Tests pass a fake with the same two methods. */
export const microsoftSignIn = {
  /** Builds the Microsoft sign-in URL. Returns { url, codeVerifier }. */
  async getSignInUrl({ state, prompt, loginHint }) {
    const { verifier, challenge } = await crypto.generatePkceCodes();
    const url = await getClient().getAuthCodeUrl({
      scopes: entraConfig.scopes,
      redirectUri: entraConfig.redirectUri,
      responseMode: 'query',
      state,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      ...(prompt && { prompt }),
      ...(loginHint && { loginHint }),
    });
    return { url, codeVerifier: verifier };
  },

  /** Exchanges the authorization code (with the client secret) for the user's ID token claims. */
  async redeemCode({ code, codeVerifier }) {
    const result = await getClient().acquireTokenByCode({
      code,
      codeVerifier,
      scopes: entraConfig.scopes,
      redirectUri: entraConfig.redirectUri,
    });
    // We keep our own session; don't let MSAL's in-memory cache grow with every sign-in.
    if (result.account) await getClient().getTokenCache().removeAccount(result.account);
    return result.idTokenClaims;
  },
};

/**
 * Decides whether Microsoft ID token claims belong to an allowed MCU user.
 * Returns { user } or { error: 'wrong_account' }.
 */
export function evaluateSignIn(claims) {
  const tenantId = String(claims?.tid ?? '').toLowerCase();
  const email = claims?.preferred_username ?? claims?.upn ?? claims?.email;
  const domain = getEmailDomain(email);

  if (!entraConfig.allowedTenantIds.includes(tenantId)) return { error: 'wrong_account' };
  if (!domain || !accountDomains.allowed.includes(domain)) return { error: 'wrong_account' };

  return {
    user: {
      oid: claims.oid,
      tenantId,
      email: email.toLowerCase(),
      name: claims.name ?? email,
      // Roles are NOT taken from Microsoft: they are managed in the system (users.repository.js)
      accountType: domain === accountDomains.student ? 'student' : 'staff',
      // Optional "login_hint" claim (enable it in Entra → Token configuration). Used at sign-out so Microsoft
      // signs out exactly this account instead of asking "Which account do you want to sign out of?"
      loginHint: typeof claims.login_hint === 'string' ? claims.login_hint : undefined,
    },
  };
}
