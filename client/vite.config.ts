import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // Keep one ignored root .env for local development and Docker Compose.
  // Vite exposes only variables prefixed with VITE_ to browser code.
  envDir: '..',
  plugins: [tailwindcss(), react()],
  server: {
    allowedHosts: [
      'flashers-thereby-wherever-telecommunications.trycloudflare.com'
    ]
  }
});
