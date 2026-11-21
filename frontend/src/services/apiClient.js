/**
 * API client. Authentication is a backend-issued session JWT in an httpOnly cookie, which the browser
 * sends automatically (credentials: 'include'). The frontend never sees or stores the token.
 *
 * In development, Vite forwards /api to the backend (vite.config.js), so the default base URL is "/api".
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

/** Fired when the session has expired (401), so the app can show the sign-in page. */
export const SESSION_EXPIRED_EVENT = 'mcu:session-expired';

export async function apiClient(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    const error = new Error(data?.message ?? `Request failed with ${res.status}`);
    error.status = res.status;
    error.details = data?.details;
    throw error;
  }
  return data;
}
