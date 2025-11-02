/**
 * Google Sign-In Button Component
 * Handles Google OAuth authentication
 */

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { apiService } from '../../../services/api';

interface GoogleSignInButtonProps {
  onLogin: (user: any) => void;
  onError?: (error: string) => void;
}

/**
 * Button for Google OAuth authentication
 * Integrates with backend API for user authentication
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onLogin, onError }) => {
  /**
   * Handles successful Google OAuth response
   */
  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log('🔐 Google Sign-In Success - Processing credential...');
    console.log('Credential response keys:', Object.keys(credentialResponse || {}));
    
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }

      console.log('📤 Sending Google credential to backend...');
      console.log('Credential length:', credentialResponse.credential.length);

      const response = await apiService.loginWithGoogle(credentialResponse.credential);
      
      console.log('📥 Backend response received:', {
        responseKeys: Object.keys(response || {}),
        hasUser: !!response?.user,
        hasTokens: !!(response?.accessToken && response?.refreshToken),
        userId: response?.user?.id,
        fullResponse: JSON.stringify(response, null, 2)
      });
      
      if (response && response.user) {
        if (response.user.id) {
          window.localStorage.setItem('currentUserId', response.user.id);
          console.log('💾 User ID saved to localStorage:', response.user.id);
        }
        
        console.log('🎉 Google authentication successful - calling onLogin callback');
        onLogin(response.user);
      } else {
        console.error('Invalid response structure:', {
          response,
          hasResponse: !!response,
          hasUser: !!response?.user,
          userData: response?.user
        });
        throw new Error('Invalid response from server - missing user data');
      }
    } catch (error) {
      console.error('❌ Google Sign-In Error:', error);
      
      let errorMessage = 'Google authentication failed';
      if (error instanceof Error) {
        if (error.message.includes('Failed to authenticate with Google')) {
          errorMessage = 'Server authentication error. Please try again.';
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  /**
   * Handles Google OAuth errors
   */
  const handleGoogleError = () => {
    const errorMessage = 'Google Sign-In failed';
    console.error(errorMessage);
    
    if (onError) {
      onError(errorMessage);
    }
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
      />
    </div>
  );
};

export default GoogleSignInButton;
