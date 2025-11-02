/**
 * Authentication Service
 * Handles user authentication, registration, and OAuth
 */

import { BaseApiService } from './baseApi';

export class AuthService extends BaseApiService {
  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   * @returns Authentication response with tokens and user data
   */
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.accessToken && response.refreshToken) {
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  /**
   * Register a new user account
   * @param name - User's full name
   * @param email - User email
   * @param password - User password
   * @param role - User role (default: 'user')
   * @returns Authentication response with tokens and user data
   */
  async register(name: string, email: string, password: string, role = 'user') {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    
    if (response.accessToken && response.refreshToken) {
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  /**
   * Authenticate user with Google OAuth credential
   * 
   * Sends Google JWT credential to backend for verification and user creation/login.
   * 
   * @param credential - JWT token from Google OAuth (@react-oauth/google)
   * @returns Authentication response with user data and JWT tokens
   */
  async loginWithGoogle(credential: string) {
    console.log('🔐 Auth Service: Sending Google credential to backend...');
    const response = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    
    console.log('📥 Auth Service: Google login response received:', {
      hasResponse: !!response,
      responseType: typeof response,
      responseKeys: response ? Object.keys(response) : [],
      hasUser: !!response?.user,
      hasAccessToken: !!response?.accessToken,
      hasRefreshToken: !!response?.refreshToken,
      userId: response?.user?.id
    });

    // Validate response structure
    if (!response) {
      throw new Error('Empty response from server - server may be down or CORS issue');
    }

    if (!response.accessToken) {
      console.error('❌ Invalid response structure - missing accessToken. Response:', response);
      throw new Error('Invalid response from server - missing accessToken');
    }

    if (!response.user) {
      console.error('❌ Invalid response structure - missing user object. Response keys:', Object.keys(response));
      throw new Error('Invalid response from server - missing user data');
    }

    if (!response.user.id || !response.user.email) {
      console.error('❌ User object incomplete:', response.user);
      throw new Error('Invalid response from server - incomplete user data');
    }
    
    if (response?.accessToken && response?.refreshToken) {
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      console.log('✅ Tokens stored in localStorage');
    } else {
      console.warn('⚠️ Response missing tokens:', { 
        hasAccessToken: !!response?.accessToken,
        hasRefreshToken: !!response?.refreshToken 
      });
    }
    return response;
  }

  /**
   * Logout the current user
   * Clears tokens and triggers logout event
   */
  logoutUser() {
    this.logout();
  }
}

export const authService = new AuthService();
