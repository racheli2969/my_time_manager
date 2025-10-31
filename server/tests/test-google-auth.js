/**
 * Simple Google Auth Test
 * 
 * This script tests the Google authentication setup to identify
 * the root cause of the 500 Internal Server Error
 */

import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

console.log('🔍 Testing Google Authentication Setup...\n');

// Test 1: Check environment variables
console.log('1️⃣  Checking environment variables:');
console.log(`   GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET'}`);

if (!GOOGLE_CLIENT_ID) {
  console.log('❌ GOOGLE_CLIENT_ID is not set!');
  console.log('💡 Add GOOGLE_CLIENT_ID to your .env file');
  process.exit(1);
}

// Test 2: Create OAuth2Client
console.log('\n2️⃣  Creating OAuth2Client:');
try {
  const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  console.log('✅ OAuth2Client created successfully');
  
  // Test 3: Try to verify a mock token (this will fail but show us the error)
  console.log('\n3️⃣  Testing token verification with mock token:');
  try {
    await googleClient.verifyIdToken({
      idToken: 'mock-token',
      audience: GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    console.log('⚠️  Expected error with mock token:', error.message);
    
    // Check if it's the right type of error (token verification error vs setup error)
    if (error.message.includes('Wrong number of segments') || 
        error.message.includes('Invalid token') ||
        error.message.includes('Token used too late')) {
      console.log('✅ OAuth2Client is working correctly (mock token rejected as expected)');
    } else {
      console.log('❌ Unexpected error - possible setup issue:', error.message);
    }
  }
  
  console.log('\n🎉 Google authentication setup appears to be working!');
  console.log('\n💡 The 500 error might be caused by:');
  console.log('   - Invalid Google JWT token from frontend');
  console.log('   - Network issues with Google verification');
  console.log('   - Database connection problems');
  console.log('   - Missing error handling in auth routes');
  
} catch (error) {
  console.log('❌ Failed to create OAuth2Client:', error.message);
  console.log('\n🔧 Possible fixes:');
  console.log('   - Check if google-auth-library is installed: npm install google-auth-library');
  console.log('   - Verify GOOGLE_CLIENT_ID format');
  console.log('   - Check internet connection');
}

console.log('\n📋 Next steps:');
console.log('   1. Check server logs when testing Google Sign-In');
console.log('   2. Add more detailed error logging to auth.js');
console.log('   3. Test with a real Google JWT token');