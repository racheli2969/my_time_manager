// Quick test to verify .env loading
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing .env file loading...\n');

const result = config({ path: resolve(__dirname, '.env'), debug: true });

if (result.error) {
  console.error('❌ Error loading .env:', result.error);
} else {
  console.log('✅ .env file loaded successfully!\n');
  console.log('Environment variables:');
  console.log('VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL || 'NOT SET ❌');
  console.log('VITE_GOOGLE_CLIENT_ID:', process.env.VITE_GOOGLE_CLIENT_ID ? 'SET ✅' : 'NOT SET ❌');
  console.log('VITE_ENABLE_GOOGLE_AUTH:', process.env.VITE_ENABLE_GOOGLE_AUTH || 'NOT SET ❌');
  console.log('VITE_ENABLE_PAYMENTS:', process.env.VITE_ENABLE_PAYMENTS || 'NOT SET ❌');
  console.log('VITE_STRIPE_PUBLIC_KEY:', process.env.VITE_STRIPE_PUBLIC_KEY ? 'SET ✅' : 'NOT SET ❌');
}