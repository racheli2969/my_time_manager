// Environment configuration - loaded from .env file via Vite
console.log('🔍 Raw import.meta.env:', import.meta.env);

export const ENV_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
  ENABLE_GOOGLE_AUTH: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true',
  ENABLE_PAYMENTS: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
  IS_DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
} as const;

// Debug logging
console.log('🚀 Environment Configuration Loaded from .env:', {
  API_BASE_URL: ENV_CONFIG.API_BASE_URL,
  GOOGLE_CLIENT_ID: ENV_CONFIG.GOOGLE_CLIENT_ID ? `${ENV_CONFIG.GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'NOT SET',
  ENABLE_GOOGLE_AUTH: ENV_CONFIG.ENABLE_GOOGLE_AUTH,
  ENABLE_PAYMENTS: ENV_CONFIG.ENABLE_PAYMENTS,
  IS_DEV: ENV_CONFIG.IS_DEV,
  MODE: ENV_CONFIG.MODE,
});

// Validation
if (!ENV_CONFIG.API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not set in .env file');
}

if (ENV_CONFIG.ENABLE_GOOGLE_AUTH && !ENV_CONFIG.GOOGLE_CLIENT_ID) {
  throw new Error('VITE_GOOGLE_CLIENT_ID is required when Google Auth is enabled');
}