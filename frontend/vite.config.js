import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.VITE_BACKEND_URL || 'http://localhost:4000';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      // The backend handles Microsoft 365 sign-in. Forwarding these paths keeps the frontend and API on one
      // origin, so the httpOnly session cookie just works. /auth/callback is the ENTRA_REDIRECT_URI path.
      proxy: {
        '/api': { target: backend, changeOrigin: true },
        '/auth/callback': { target: backend, changeOrigin: true },
      },
    },
  };
});
