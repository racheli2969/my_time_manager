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

  // 1. Load from system environment variables (process.env)
  // This is what Render uses when you set variables in the dashboard
  const systemEnvVars: Record<string, string> = {};
  ['VITE_API_BASE_URL', 'VITE_GOOGLE_CLIENT_ID', 'VITE_ENABLE_GOOGLE_AUTH', 'VITE_ENABLE_PAYMENTS', 'VITE_STRIPE_PUBLIC_KEY'].forEach(key => {
    if (process.env[key]) {
      systemEnvVars[key] = process.env[key]!;
    }
  });

  if (Object.keys(systemEnvVars).length > 0) {
    Object.assign(env, systemEnvVars);
    console.log('✅ Loaded from system environment variables');
  }

  // 2. Try .env.json (Windows-safe, JSON encoding-proof)
  try {
    const envJsonPath = path.join(process.cwd(), '.env.json');
    if (fs.existsSync(envJsonPath)) {
      const envJson = JSON.parse(fs.readFileSync(envJsonPath, 'utf8'));
      // Only add missing values from .env.json (don't override system vars)
      Object.keys(envJson).forEach(key => {
        if (!env[key]) {
          env[key] = envJson[key];
        }
      });
      if (Object.keys(systemEnvVars).length === 0) {
        console.log('✅ Loaded from .env.json (Windows-safe)');
      }
    }
  } catch (error) {
    // Silently fail - not all environments need .env.json
  }

  // 3. Fallback to .env file (standard approach)
  if (!env.VITE_API_BASE_URL) {
    try {
      const envFile = loadEnv(mode, process.cwd(), 'VITE_');
      Object.keys(envFile).forEach(key => {
        if (!env[key]) {
          env[key] = envFile[key];
        }
      });
      if (Object.keys(envFile).length > 0 && Object.keys(systemEnvVars).length === 0) {
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
