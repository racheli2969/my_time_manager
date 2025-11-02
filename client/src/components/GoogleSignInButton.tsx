
import { GoogleLogin } from '@react-oauth/google';
import { apiService } from '../services/api';

/**
 * GoogleSignInButton Component
 * 
 * Handles Google OAuth authentication using the @react-oauth/google library.
 * This component integrates with the backend API to authenticate users via Google.
 * 
 * @param onLogin - Callback function called when authentication is successful
 * @param onError - Optional callback function called when authentication fails
 */
interface GoogleSignInButtonProps {
  onLogin: (user: any) => void;
  onError?: (error: string) => void;
}

function GoogleSignInButton({ onLogin, onError }: GoogleSignInButtonProps) {
  /**
   * Handles successful Google OAuth response
   * 
   * @param credentialResponse - Response object containing the JWT credential from Google
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

      // Send the Google JWT credential to our backend for verification and user creation/login
      const response = await apiService.loginWithGoogle(credentialResponse.credential);
      
      console.log('📥 Backend response received:', {
        responseKeys: Object.keys(response || {}),
        hasUser: !!response?.user,
        hasTokens: !!(response?.accessToken && response?.refreshToken),
        userId: response?.user?.id,
        fullResponse: JSON.stringify(response, null, 2)
      });
      
      if (response && response.user) {
        // Save user ID to localStorage for persistence
        if (response.user.id) {
          window.localStorage.setItem('currentUserId', response.user.id);
          console.log('💾 User ID saved to localStorage:', response.user.id);
        }
        
        console.log('🎉 Google authentication successful - calling onLogin callback');
        
        // Call the onLogin callback with the authenticated user
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
      
      // Provide more detailed error information
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
      
      // Call the onError callback if provided
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
}

export default GoogleSignInButton;