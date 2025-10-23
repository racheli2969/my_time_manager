import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Expose VITE_ env variables to client
      __VITE_GOOGLE_CLIENT_ID__: JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      __VITE_API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL),
      __VITE_ENABLE_GOOGLE_AUTH__: env.VITE_ENABLE_GOOGLE_AUTH,
      __VITE_ENABLE_PAYMENTS__: env.VITE_ENABLE_PAYMENTS,
    },
    server: {
      host: true,
      port: 5173,
    },
  };
});
