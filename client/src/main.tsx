import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import  App  from './App.tsx';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

/**
 * Google OAuth Configuration
 * 
 * Uses environment variable for Google Client ID with fallback to hardcoded value.
 * Make sure to set VITE_GOOGLE_CLIENT_ID in your .env file for production.
 */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
  '878087340135-b0kfskt6nhrp8835fsvg4r6u1o4k5voh.apps.googleusercontent.com';

console.log('🔐 Google OAuth Configuration:', {
  clientId: GOOGLE_CLIENT_ID.substring(0, 20) + '...',
  usingEnvVar: !!import.meta.env.VITE_GOOGLE_CLIENT_ID
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);


