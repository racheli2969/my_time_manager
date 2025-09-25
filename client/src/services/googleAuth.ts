/**
 * Google Authentication Service
 * 
 * This service handles Google OAuth 2.0 authentication using Google Identity Services (GIS).
 * It provides methods to initialize Google auth, handle login, and logout.
 * 
 * Features:
 * - Initialize Google Identity Services
 * - Handle Google OAuth login flow
 * - Parse JWT tokens from Google
 * - Integrate with existing authentication system
 */

// Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCallbackResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string;
}

interface GoogleCallbackResponse {
  credential: string; // JWT token
  select_by?: string;
}

interface GoogleUserProfile {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
}

class GoogleAuthService {
  private clientId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }

  /**
   * Initialize Google Identity Services
   * Loads the Google Identity Services script and initializes the authentication
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!this.clientId) {
      throw new Error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    }

    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (window.google?.accounts?.id) {
        this.setupGoogleAuth();
        this.isInitialized = true;
        resolve();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Wait a bit for the Google object to be available
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            this.setupGoogleAuth();
            this.isInitialized = true;
            resolve();
          } else {
            reject(new Error('Failed to load Google Identity Services'));
          }
        }, 100);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Setup Google Auth configuration
   */
  private setupGoogleAuth(): void {
    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services not loaded');
    }

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleGoogleCallback.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  /**
   * Handle the callback from Google authentication
   * @param response - The response from Google containing the JWT credential
   */
  private handleGoogleCallback(response: GoogleCallbackResponse): void {
    try {
      const userProfile = this.parseJWT(response.credential);
      
      // Dispatch custom event with user profile data
      window.dispatchEvent(new CustomEvent('googleLoginSuccess', {
        detail: { userProfile, credential: response.credential }
      }));
    } catch (error) {
      console.error('Error parsing Google JWT:', error);
      window.dispatchEvent(new CustomEvent('googleLoginError', {
        detail: { error: 'Failed to parse Google authentication response' }
      }));
    }
  }

  /**
   * Parse JWT token from Google
   * @param token - The JWT token from Google
   * @returns Parsed user profile
   */
  private parseJWT(token: string): GoogleUserProfile {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token from Google');
    }
  }

  /**
   * Render Google Sign-In button
   * @param element - The HTML element to render the button in
   * @param config - Optional button configuration
   */
  renderButton(element: HTMLElement, config: Partial<GoogleButtonConfig> = {}): void {
    if (!this.isInitialized) {
      throw new Error('Google Auth not initialized. Call initialize() first.');
    }

    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services not available');
    }

    const buttonConfig: GoogleButtonConfig = {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: '100%',
      ...config
    };

    window.google.accounts.id.renderButton(element, buttonConfig);
  }

  /**
   * Show Google One Tap prompt
   */
  prompt(): void {
    if (!this.isInitialized) {
      throw new Error('Google Auth not initialized. Call initialize() first.');
    }

    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services not available');
    }

    window.google.accounts.id.prompt();
  }

  /**
   * Disable auto-select for future sessions
   */
  disableAutoSelect(): void {
    if (!this.isInitialized) {
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  /**
   * Get the configured client ID
   */
  getClientId(): string {
    return this.clientId;
  }

  /**
   * Check if Google Auth is initialized
   */
  isGoogleAuthInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();

// Export types for use in components
export type { GoogleUserProfile, GoogleButtonConfig };