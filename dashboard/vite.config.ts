import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BACKEND_URL is env-overridable so Docker Compose can point the dev proxy at
// the backend service name (http://backend:8000) instead of localhost.
// Local dev keeps working with zero config (defaults to localhost:8000).
const backendTarget = process.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 3000,
  },
  server: {
    port: 5176,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api/v1': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5176,
  },
});
