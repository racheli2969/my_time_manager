// Test fallback environment configuration
import { ENV_CONFIG } from '../src/config/env.js';

console.log('\n========================================');
console.log('Environment Configuration Test - Fallback Values');
console.log('========================================');
console.log('API_BASE_URL:', ENV_CONFIG.API_BASE_URL);
console.log('GOOGLE_CLIENT_ID:', ENV_CONFIG.GOOGLE_CLIENT_ID ? 'SET ✓' : 'NOT SET ❌');
console.log('ENABLE_GOOGLE_AUTH:', ENV_CONFIG.ENABLE_GOOGLE_AUTH);
console.log('ENABLE_PAYMENTS:', ENV_CONFIG.ENABLE_PAYMENTS);
console.log('STRIPE_PUBLIC_KEY:', ENV_CONFIG.STRIPE_PUBLIC_KEY ? 'SET ✓' : 'NOT SET ❌');
console.log('IS_DEV:', ENV_CONFIG.IS_DEV);
console.log('MODE:', ENV_CONFIG.MODE);
console.log('========================================\n');

// Check if all required values are present
const allSet = ENV_CONFIG.API_BASE_URL && 
               ENV_CONFIG.GOOGLE_CLIENT_ID && 
               ENV_CONFIG.STRIPE_PUBLIC_KEY;

console.log(allSet ? '✅ All environment variables are set!' : '❌ Some environment variables are missing!');