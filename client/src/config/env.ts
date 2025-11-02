// Environment configuration - loaded from multiple sources via Vite
// Sources (in priority order):
// 1. System environment variables
// 2. .env.json (Windows-safe, JSON encoding-proof)
// 3. .env file (standard approach)

console.log('🔍 Loading environment configuration...');

export const ENV_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
  ENABLE_GOOGLE_AUTH: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true',
  ENABLE_PAYMENTS: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY as string,
  IS_DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
} as const;

// Validation
console.log('🚀 Environment Configuration:', {
  API_BASE_URL: ENV_CONFIG.API_BASE_URL || '❌ NOT SET',
  GOOGLE_CLIENT_ID: ENV_CONFIG.GOOGLE_CLIENT_ID ? '✓ SET' : '❌ NOT SET',
  ENABLE_GOOGLE_AUTH: ENV_CONFIG.ENABLE_GOOGLE_AUTH,
  ENABLE_PAYMENTS: ENV_CONFIG.ENABLE_PAYMENTS,
  STRIPE_PUBLIC_KEY: ENV_CONFIG.STRIPE_PUBLIC_KEY ? '✓ SET' : '❌ NOT SET',
  IS_DEV: ENV_CONFIG.IS_DEV,
  MODE: ENV_CONFIG.MODE,
});

// Warn if critical variables are missing
if (!ENV_CONFIG.API_BASE_URL) {
  console.warn('⚠️  VITE_API_BASE_URL is not set!');
}

if (ENV_CONFIG.ENABLE_GOOGLE_AUTH && !ENV_CONFIG.GOOGLE_CLIENT_ID) {
  console.warn('⚠️  VITE_GOOGLE_CLIENT_ID is required when Google Auth is enabled');
}

// Validation
console.log('🚀 Environment Configuration:', {
  API_BASE_URL: ENV_CONFIG.API_BASE_URL || '❌ NOT SET',
  GOOGLE_CLIENT_ID: ENV_CONFIG.GOOGLE_CLIENT_ID ? '✓ SET' : '❌ NOT SET',
  ENABLE_GOOGLE_AUTH: ENV_CONFIG.ENABLE_GOOGLE_AUTH,
  ENABLE_PAYMENTS: ENV_CONFIG.ENABLE_PAYMENTS,
  STRIPE_PUBLIC_KEY: ENV_CONFIG.STRIPE_PUBLIC_KEY ? '✓ SET' : '❌ NOT SET',
  IS_DEV: ENV_CONFIG.IS_DEV,
  MODE: ENV_CONFIG.MODE,
});

// Warn if critical variables are missing
if (!ENV_CONFIG.API_BASE_URL) {
  console.warn('⚠️  VITE_API_BASE_URL is not set!');
}

if (ENV_CONFIG.ENABLE_GOOGLE_AUTH && !ENV_CONFIG.GOOGLE_CLIENT_ID) {
  console.warn('⚠️  VITE_GOOGLE_CLIENT_ID is required when Google Auth is enabled');
}