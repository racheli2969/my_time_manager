/**
 * Google Sign-In Button Component
 * 
 * This component renders a Google Sign-In button using Google Identity Services.
 * It handles the complete OAuth flow and integrates with the existing authentication system.
 * 
 * Features:
 * - Renders Google-styled sign-in button
 * - Handles Google OAuth authentication flow
 * - Integrates with existing login system
 * - Provides loading states and error handling
 * - Customizable button appearance
 */

import React, { useEffect, useRef, useState } from 'react';
import { googleAuthService, type GoogleButtonConfig, type GoogleUserProfile } from '../services/googleAuth';
import { apiService } from '../services/api';

interface GoogleSignInButtonProps {
  /** Callback function called when login is successful */
  onSuccess: (user: any) => void;
  /** Callback function called when login fails */
  onError?: (error: string) => void;
  /** Custom button configuration */
  buttonConfig?: Partial<GoogleButtonConfig>;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * GoogleSignInButton Component
 * 
 * Renders a Google Sign-In button that handles the complete OAuth flow.
 * Automatically initializes Google Identity Services and manages authentication state.
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  buttonConfig = {},
  disabled = false,
  className = '',
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  useEffect(() => {
    if (isInitialized && buttonRef.current && !disabled) {
      renderGoogleButton();
    }
  }, [isInitialized, disabled, buttonConfig]);

  useEffect(() => {
    // Listen for Google authentication events
    const handleGoogleSuccess = (event: CustomEvent) => {
      handleGoogleLogin(event.detail.userProfile, event.detail.credential);
    };

    const handleGoogleError = (event: CustomEvent) => {
      const errorMessage = event.detail.error || 'Google authentication failed';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
    };

    window.addEventListener('googleLoginSuccess', handleGoogleSuccess as EventListener);
    window.addEventListener('googleLoginError', handleGoogleError as EventListener);

    return () => {
      window.removeEventListener('googleLoginSuccess', handleGoogleSuccess as EventListener);
      window.removeEventListener('googleLoginError', handleGoogleError as EventListener);
    };
  }, [onSuccess, onError]);

  /**
   * Initialize Google Authentication Service
   */
  const initializeGoogleAuth = async () => {
    try {
      setError('');
      await googleAuthService.initialize();
      setIsInitialized(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Google authentication';
      console.error('Google Auth initialization error:', error);
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  /**
   * Render the Google Sign-In button
   */
  const renderGoogleButton = () => {
    if (!buttonRef.current || !isInitialized) return;

    try {
      // Clear previous button content
      buttonRef.current.innerHTML = '';
      
      const config: Partial<GoogleButtonConfig> = {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: '100%',
        ...buttonConfig,
      };

      googleAuthService.renderButton(buttonRef.current, config);
    } catch (error) {
      console.error('Error rendering Google button:', error);
      setError('Failed to render Google sign-in button');
    }
  };

  /**
   * Handle successful Google authentication
   * @param userProfile - User profile from Google
   * @param credential - JWT credential from Google
   */
  const handleGoogleLogin = async (userProfile: GoogleUserProfile, credential: string) => {
    try {
      setIsLoading(true);
      setError('');

      // Send Google credential to our backend for verification and user creation/login
      const response = await apiService.loginWithGoogle(credential);

      // Save user ID to localStorage (maintaining consistency with existing auth)
      if (response && response.user && response.user.id) {
        window.localStorage.setItem('currentUserId', response.user.id);
      }

      // Call success callback
      onSuccess(response.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      console.error('Google login error:', error);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while initializing
  if (!isInitialized && !error) {
    return (
      <div className={`flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading Google Sign-In...</span>
      </div>
    );
  }

  // Show error state
  if (error && !isInitialized) {
    return (
      <div className={`py-3 px-4 border border-red-300 rounded-lg bg-red-50 ${className}`}>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={initializeGoogleAuth}
          className="mt-2 text-blue-600 hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Google button container */}
      <div 
        ref={buttonRef}
        className={`${disabled ? 'opacity-50 pointer-events-none' : ''} ${isLoading ? 'opacity-50' : ''}`}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Signing in...</span>
        </div>
      )}
      
      {/* Error message */}
      {error && isInitialized && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default GoogleSignInButton;