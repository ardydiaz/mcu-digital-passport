export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI ?? window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

// Scope exposed by the backend API app registration, e.g. api://<api-client-id>/access_as_user
export const apiRequest = {
  scopes: [import.meta.env.VITE_API_SCOPE],
};
