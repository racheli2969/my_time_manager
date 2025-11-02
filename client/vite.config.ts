import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Multi-source environment loading with smart fallbacks:
  // 1. System environment variables (process.env) - highest priority
  // 2. .env.json file (JSON is encoding-safe for Windows)
  // 3. .env file (standard, for production)

  let env: Record<string, string> = {};

  console.log('🔧 Vite Config - Loading environment variables:');
  console.log('Mode:', mode);
  console.log('---');

  // 1. Try system environment variables first
  const systemVars = loadEnv(mode, process.cwd(), 'VITE_');
  if (Object.keys(systemVars).length > 0) {
    Object.assign(env, systemVars);
    console.log('✅ Loaded from system environment');
  }

  // 2. Try .env.json (Windows-safe, JSON encoding-proof)
  try {
    const envJsonPath = path.join(process.cwd(), '.env.json');
    if (fs.existsSync(envJsonPath)) {
      const envJson = JSON.parse(fs.readFileSync(envJsonPath, 'utf8'));
      Object.assign(env, envJson);
      console.log('✅ Loaded from .env.json (Windows-safe)');
    }
  } catch (error) {
    // Silently fail - not all environments need .env.json
  }

  // 3. Fallback to .env (standard approach)
  if (!env.VITE_API_BASE_URL) {
    try {
      const envFile = loadEnv(mode, process.cwd(), 'VITE_');
      Object.assign(env, envFile);
      if (Object.keys(envFile).length > 0) {
        console.log('✅ Loaded from .env file');
      }
    } catch (error) {
      // Silently fail
    }
  }

  // Show what was loaded
  console.log('---');
  console.log('VITE_API_BASE_URL:', env.VITE_API_BASE_URL ? '✓ SET' : '❌ NOT SET');
  console.log('VITE_GOOGLE_CLIENT_ID:', env.VITE_GOOGLE_CLIENT_ID ? '✓ SET' : '❌ NOT SET');
  console.log('VITE_ENABLE_GOOGLE_AUTH:', env.VITE_ENABLE_GOOGLE_AUTH ? '✓ SET' : '❌ NOT SET');
  console.log('VITE_ENABLE_PAYMENTS:', env.VITE_ENABLE_PAYMENTS ? '✓ SET' : '❌ NOT SET');
  console.log('VITE_STRIPE_PUBLIC_KEY:', env.VITE_STRIPE_PUBLIC_KEY ? '✓ SET' : '❌ NOT SET');
  console.log('---\n');

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
    // Expose all environment variables to the client
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || ''),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || ''),
      'import.meta.env.VITE_ENABLE_GOOGLE_AUTH': JSON.stringify(env.VITE_ENABLE_GOOGLE_AUTH || ''),
      'import.meta.env.VITE_ENABLE_PAYMENTS': JSON.stringify(env.VITE_ENABLE_PAYMENTS || ''),
      'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify(env.VITE_STRIPE_PUBLIC_KEY || ''),
    },
  };
});
