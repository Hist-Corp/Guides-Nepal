import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
// BACKEND_URL is env-overridable so Docker Compose can point the dev proxy at
// the backend service name (http://backend:8000) instead of localhost.
// Local dev keeps working with zero config (defaults to localhost:8000).
const backendTarget = process.env.VITE_BACKEND_URL ?? 'http://localhost:8000';
export default defineConfig({
  build: {
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 3000,
  },
  server: {
    port: 5175,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api/v1': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), tsconfigPaths()],
});
