/**
 * Base API Service
 * Handles core HTTP request functionality, authentication, and token refresh
 */

import { ENV_CONFIG } from '../config/env';

const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

export class BaseApiService {
  constructor() {
    this.refreshToken();
  }

  private refreshToken() {
    // Placeholder for token refresh on initialization
  }

  /**
   * Refresh the authentication token using the refresh token
   * @throws Error if refresh fails
   */
  private async refreshAuthToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.request('/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    } catch (error) {
      console.error('Failed to refresh auth token:', error);
      this.logout();
      throw error;
    }
  }

  /**
   * Core HTTP request method with automatic token refresh on 401
   * @param endpoint - API endpoint path
   * @param options - Fetch options
   * @returns Parsed response data
   */
  protected async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem('token');

    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
   
    try {
      const response = await fetch(url, config);
     
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && endpoint !== '/auth/refresh') {
        try {
          await this.refreshAuthToken();
          // Retry the original request with new token
          return this.request(endpoint, options);
        } catch (refreshError) {
          // If refresh fails, log out and throw error
          this.logout();
          throw new Error('Authentication failed. Please log in again.');
        }
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Parse response
      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorMsg = (data && data.error) ? data.error : (typeof data === 'string' ? data : 'Request failed');
        throw new Error(errorMsg);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Clear authentication tokens and trigger logout event
   */
  protected logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('logout'));
  }
}
