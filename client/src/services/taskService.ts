/**
 * Task Service
 * Handles task management operations
 */

import { BaseApiService } from './baseApi';

export class TaskService extends BaseApiService {
  /**
   * Get all tasks with pagination
   * @param page - Page number (optional)
   * @param pageSize - Number of items per page (optional)
   * @returns Array of tasks
   */
  async getTasks(page?: number, pageSize?: number) {
    let url = '/tasks';
    if (page !== undefined && pageSize !== undefined) {
      url += `?page=${page}&pageSize=${pageSize}`;
    }
    return this.request(url);
  }

  /**
   * Get tasks by user ID (created by or assigned to)
   * @param userId - User ID to filter tasks
   * @param page - Page number (optional)
   * @param pageSize - Number of items per page (optional)
   * @returns Array of tasks
   */
  async getTasksByUserOrAssigned(userId: string, page?: number, pageSize?: number) {
    let url = `/tasks?userId=${userId}`;
    if (page !== undefined && pageSize !== undefined) {
      url += `&page=${page}&pageSize=${pageSize}`;
    }
    return this.request(url);
  }

  /**
   * Create a new task
   * @param task - Task data
   * @returns Created task
   */
  async createTask(task: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  /**
   * Update an existing task
   * @param id - Task ID
   * @param task - Updated task data
   * @returns Updated task
   */
  async updateTask(id: string, task: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  /**
   * Delete a task
   * @param id - Task ID
   * @returns Deletion confirmation
   */
  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Split a task into multiple intervals
   * @param id - Task ID
   * @param intervals - Number of intervals to split into
   * @returns Split task data
   */
  async splitTask(id: string, intervals: number) {
    return this.request(`/tasks/${id}/split`, {
      method: 'POST',
      body: JSON.stringify({ intervals }),
    });
  }
}

export const taskService = new TaskService();
