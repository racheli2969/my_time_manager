// Environment configuration - Alternative to .env file
// This avoids encoding issues with .env files in Windows/VS Code

export const ENV_VALUES = {
  VITE_GOOGLE_CLIENT_ID: '878087340135-b0kfskt6nhrp8835fsvg4r6u1o4k5voh.apps.googleusercontent.com',
  VITE_API_BASE_URL: 'http://localhost:3001/api',
  VITE_ENABLE_GOOGLE_AUTH: 'true',
  VITE_ENABLE_PAYMENTS: 'false',
  VITE_STRIPE_PUBLIC_KEY: 'pk_test_51LhXolKf3Y2uX6zYxX5G6Yz3Z1bX9z5J6k'
};

// Set environment variables programmatically to avoid .env encoding issues
Object.entries(ENV_VALUES).forEach(([key, value]) => {
  if (typeof process !== 'undefined' && process.env) {
    process.env[key] = value;
  }
});

console.log('📦 Environment variables loaded from env-config.js:', {
  VITE_API_BASE_URL: ENV_VALUES.VITE_API_BASE_URL,
  VITE_GOOGLE_CLIENT_ID: ENV_VALUES.VITE_GOOGLE_CLIENT_ID ? 'SET ✓' : 'NOT SET ❌',
  VITE_ENABLE_GOOGLE_AUTH: ENV_VALUES.VITE_ENABLE_GOOGLE_AUTH,
  VITE_ENABLE_PAYMENTS: ENV_VALUES.VITE_ENABLE_PAYMENTS,
  VITE_STRIPE_PUBLIC_KEY: ENV_VALUES.VITE_STRIPE_PUBLIC_KEY ? 'SET ✓' : 'NOT SET ❌'
});