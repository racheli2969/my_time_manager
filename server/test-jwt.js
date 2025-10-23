import 'dotenv/config';
import { generateAccessToken, verifyToken } from './config/jwt.js';

console.log('Testing JWT functionality...');

// Test token generation and verification
const testPayload = { id: 'test-user-123', email: 'test@example.com' };

try {
  console.log('1. Generating token...');
  const token = generateAccessToken(testPayload);
  console.log('Token generated:', token.substring(0, 50) + '...');

  console.log('2. Verifying token...');
  const decoded = verifyToken(token);
  console.log('Token verified successfully:', decoded);

  console.log('3. JWT test passed!');
} catch (error) {
  console.error('JWT test failed:', error.message);
}
