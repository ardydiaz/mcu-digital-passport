import { getAccessToken } from './tokenService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export async function apiClient(path, { method = 'GET', body, headers = {} } = {}) {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message ?? `Request failed with ${res.status}`);
    error.status = res.status;
    error.details = data?.details;
    throw error;
  }
  return data;
}
