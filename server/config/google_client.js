/**
 * Google OAuth2 Configuration
 * 
 * This module contains Google OAuth2 configuration constants and utilities.
 * The actual OAuth2Client instance is created directly in the auth routes
 * for better isolation and testing capabilities.
 * 
 * Environment Variables Required:
 * - GOOGLE_CLIENT_ID: Your Google OAuth2 client ID from Google Console
 * - GOOGLE_CLIENT_SECRET: Your Google OAuth2 client secret (for server-side flows)
 * - GOOGLE_REDIRECT_URI: Authorized redirect URI (for server-side flows)
 * 
 * Note: For JWT token verification (our current approach), only GOOGLE_CLIENT_ID is needed.
 */

/**
 * Google OAuth2 Client ID
 * Used for verifying JWT tokens from Google Sign-In
 */
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

/**
 * Google OAuth2 Client Secret
 * Used for server-side OAuth flows (not needed for JWT verification)
 */
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Google OAuth2 Redirect URI
 * Used for server-side OAuth flows (not needed for JWT verification)
 */
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Validate required environment variables
if (!GOOGLE_CLIENT_ID) {
  console.error('❌ GOOGLE_CLIENT_ID environment variable is required for Google authentication');
  console.log('💡 Get your Google Client ID from: https://console.developers.google.com/');
}

// Log configuration status (without exposing sensitive values)
if (GOOGLE_CLIENT_ID) {
  console.log('✅ Google OAuth2 configuration loaded');
  console.log(`   Client ID: ${GOOGLE_CLIENT_ID.substring(0, 20)}...`);
} else {
  console.warn('⚠️  Google OAuth2 not configured - Google Sign-In will not work');
}

/**
 * Google OAuth2 Configuration Object
 * Centralized configuration for Google authentication
 */
export const googleConfig = {
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_REDIRECT_URI,
  
  // Scopes for Google Sign-In (basic profile information)
  scopes: [
    'openid',
    'email', 
    'profile'
  ],
  
  // Token verification settings
  verification: {
    audience: GOOGLE_CLIENT_ID,
    issuer: ['accounts.google.com', 'https://accounts.google.com']
  }
};

export default googleConfig;