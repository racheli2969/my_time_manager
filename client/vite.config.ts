import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      __VITE_GOOGLE_CLIENT_ID__: JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      __VITE_API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL),
      __VITE_ENABLE_GOOGLE_AUTH__: JSON.stringify(env.VITE_ENABLE_GOOGLE_AUTH),
      __VITE_ENABLE_PAYMENTS__: JSON.stringify(env.VITE_ENABLE_PAYMENTS),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    base: './', // <-- IMPORTANT for Render or any non-root static deployment
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 5173,
    },
  };
});
