/**
 * Team Service
 * Handles team management and collaboration operations
 */

import { BaseApiService } from './baseApi';

export class TeamService extends BaseApiService {
  /**
   * Get all teams
   * @returns Array of teams
   */
  async getTeams() {
    return this.request('/teams');
  }

  /**
   * Create a new team
   * @param team - Team data
   * @returns Created team
   */
  async createTeam(team: any) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify(team),
    });
  }

  /**
   * Update an existing team
   * @param id - Team ID
   * @param team - Updated team data
   * @returns Updated team
   */
  async updateTeam(id: string, team: any) {
    return this.request(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(team),
    });
  }

  /**
   * Delete a team
   * @param id - Team ID
   * @returns Deletion confirmation
   */
  async deleteTeam(id: string) {
    return this.request(`/teams/${id}`, {
      method: 'DELETE',
    });
  }
}

export const teamService = new TeamService();
