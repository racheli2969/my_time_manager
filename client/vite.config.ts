import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' means to load all env vars, not just VITE_ prefixed
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('🔧 Vite Config - Loading environment variables:');
  console.log('Mode:', mode);
  console.log('CWD:', process.cwd());
  console.log('VITE_API_BASE_URL:', env.VITE_API_BASE_URL);
  console.log('VITE_GOOGLE_CLIENT_ID:', env.VITE_GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    base: './',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 5173,
    },
    // Make sure VITE_ prefixed env vars are exposed to client
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || ''),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || ''),
      'import.meta.env.VITE_ENABLE_GOOGLE_AUTH': JSON.stringify(env.VITE_ENABLE_GOOGLE_AUTH || ''),
      'import.meta.env.VITE_ENABLE_PAYMENTS': JSON.stringify(env.VITE_ENABLE_PAYMENTS || ''),
      'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify(env.VITE_STRIPE_PUBLIC_KEY || ''),
    },
  };
});
