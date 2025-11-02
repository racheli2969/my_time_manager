/**
 * Schedule Service
 * Handles intelligent scheduling, conflicts, and personal events
 */

import { BaseApiService } from './baseApi';

export class ScheduleService extends BaseApiService {
  /**
   * Generate an intelligent schedule
   * @param _userId - User ID (passed to backend in options)
   * @param options - Schedule generation options
   * @returns Generated schedule data
   */
  async generateSchedule(_userId: string, options: any = {}) {
    return this.request('/schedule', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  /**
   * Get current schedule
   * @returns Schedule entries
   */
  async getSchedule() {
    return this.request('/schedule');
  }

  /**
   * Update a schedule entry
   * @param entryId - Schedule entry ID
   * @param updates - Updated entry data
   * @returns Updated schedule entry
   */
  async updateScheduleEntry(entryId: string, updates: any) {
    return this.request(`/schedule/entry/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get schedule conflicts
   * @returns Array of conflicts
   */
  async getScheduleConflicts() {
    return this.request('/schedule/conflicts');
  }

  /**
   * Resolve a schedule conflict
   * @param conflictId - Conflict ID
   * @param resolutionAction - Resolution action to take
   * @returns Resolution result
   */
  async resolveConflict(conflictId: string, resolutionAction: string) {
    return this.request(`/schedule/conflicts/${conflictId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolutionAction }),
    });
  }

  /**
   * Get user's schedule preferences
   * @returns Schedule preferences
   */
  async getSchedulePreferences() {
    return this.request('/schedule/preferences');
  }

  /**
   * Update schedule preferences
   * @param preferences - Updated preferences
   * @returns Updated preferences
   */
  async updateSchedulePreferences(preferences: any) {
    return this.request('/schedule/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  /**
   * Add a personal event to calendar
   * @param event - Event data
   * @returns Created event
   */
  async addPersonalEvent(event: any) {
    return this.request('/schedule/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  /**
   * Get personal events within date range
   * @param startDate - Start date (ISO string, optional)
   * @param endDate - End date (ISO string, optional)
   * @returns Array of personal events
   */
  async getPersonalEvents(startDate?: string, endDate?: string) {
    let url = '/schedule/events';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.request(url);
  }

  /**
   * Delete a personal event
   * @param eventId - Event ID
   * @returns Deletion confirmation
   */
  async deletePersonalEvent(eventId: string) {
    return this.request(`/schedule/events/${eventId}`, {
      method: 'DELETE',
    });
  }
}

export const scheduleService = new ScheduleService();
