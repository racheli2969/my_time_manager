/**
 * User Service
 * Handles user profile and settings operations
 */

import { BaseApiService } from './baseApi';

export class UserService extends BaseApiService {
  /**
   * Get all users
   * @returns Array of users
   */
  async getUsers() {
    return this.request('/users');
  }

  /**
   * Get current user's profile
   * @returns User profile data
   */
  async getProfile() {
    return this.request('/users/profile');
  }

  /**
   * Update current user's profile
   * @param profile - Updated profile data
   * @returns Updated profile
   */
  async updateProfile(profile: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }
}

export const userService = new UserService();
