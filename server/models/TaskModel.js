/**
 * Task Model
 * 
 * Handles all database operations for tasks
 */

import db from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError } from '../utils/errors.js';
import { TaskStatus, TaskPriority, Defaults } from '../constants/index.js';

class TaskModel {
  /**
   * Find task by ID
   * @param {string} taskId - Task ID
   * @returns {Object|null} Task object or null
   */
  findById(taskId) {
    try {
      return db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    } catch (error) {
      throw new DatabaseError('Failed to find task', error);
    }
  }

  /**
   * Find tasks for user (created by or assigned to)
   * @param {string} userId - User ID
   * @param {Object} options - Query options (pagination, filters)
   * @returns {Array} Array of tasks
   */
  findByUserId(userId, options = {}) {
    try {
      const {
        page = 1,
        pageSize = Defaults.PAGE_SIZE,
        status = null,
        priority = null
      } = options;

      const offset = (page - 1) * pageSize;
      let query = `
        SELECT t.*, 
               u.name as assigned_to_name,
               tm.name as team_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN teams tm ON t.team_id = tm.id
        WHERE (t.created_by = ? OR t.assigned_to = ? OR t.team_id IN (
          SELECT team_id FROM team_members WHERE user_id = ?
        ))
      `;

      const params = [userId, userId, userId];

      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }

      if (priority) {
        query += ' AND t.priority = ?';
        params.push(priority);
      }

      query += ' ORDER BY t.created_at DESC, t.ROWID DESC LIMIT ? OFFSET ?';
      params.push(pageSize, offset);

      return db.prepare(query).all(...params);
    } catch (error) {
      throw new DatabaseError('Failed to fetch user tasks', error);
    }
  }

  /**
   * Find incomplete tasks for user
   * @param {string} userId - User ID
   * @returns {Array} Array of incomplete tasks
   */
  findIncompleteByUserId(userId) {
    try {
      return db.prepare(`
        SELECT t.*, ti.id as interval_id, ti.duration as interval_duration, 
               ti.is_completed as interval_completed
        FROM tasks t
        LEFT JOIN task_intervals ti ON t.id = ti.task_id AND ti.is_completed = 0
        WHERE (t.created_by = ? OR t.assigned_to = ?) AND t.status != ?
        ORDER BY 
          CASE t.priority 
            WHEN 'urgent' THEN 4 
            WHEN 'high' THEN 3 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 1 
          END DESC,
          t.due_date ASC,
          t.created_at ASC
      `).all(userId, userId, TaskStatus.COMPLETED);
    } catch (error) {
      throw new DatabaseError('Failed to fetch incomplete tasks', error);
    }
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Object} Created task
   */
  create(taskData) {
    try {
      const taskId = uuidv4();
      const {
        title,
        description = null,
        dueDate,
        estimatedDuration,
        priority = TaskPriority.MEDIUM,
        status = TaskStatus.TODO,
        assignedTo = null,
        teamId = null,
        createdBy,
        tags = []
      } = taskData;

      db.prepare(`
        INSERT INTO tasks (
          id, title, description, due_date, estimated_duration,
          priority, status, assigned_to, team_id, created_by, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        taskId, title, description, dueDate, estimatedDuration,
        priority, status, assignedTo, teamId, createdBy, JSON.stringify(tags)
      );

      return this.findById(taskId);
    } catch (error) {
      throw new DatabaseError('Failed to create task', error);
    }
  }

  /**
   * Update task
   * @param {string} taskId - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated task
   */
  update(taskId, updates) {
    try {
      const fields = [];
      const values = [];

      const allowedFields = {
        title: 'title',
        description: 'description',
        dueDate: 'due_date',
        estimatedDuration: 'estimated_duration',
        priority: 'priority',
        status: 'status',
        assignedTo: 'assigned_to',
        teamId: 'team_id',
        tags: 'tags'
      };

      Object.entries(updates).forEach(([key, value]) => {
        const dbField = allowedFields[key];
        if (dbField) {
          fields.push(`${dbField} = ?`);
          if (key === 'tags' && Array.isArray(value)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      });

      if (fields.length === 0) {
        return this.findById(taskId);
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(taskId);

      db.prepare(`
        UPDATE tasks SET ${fields.join(', ')}
        WHERE id = ?
      `).run(...values);

      return this.findById(taskId);
    } catch (error) {
      throw new DatabaseError('Failed to update task', error);
    }
  }

  /**
   * Delete task
   * @param {string} taskId - Task ID
   * @returns {boolean} True if deleted
   */
  delete(taskId) {
    try {
      const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
      return result.changes > 0;
    } catch (error) {
      throw new DatabaseError('Failed to delete task', error);
    }
  }

  /**
   * Check if user has access to task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {boolean} True if user has access
   */
  hasAccess(taskId, userId) {
    try {
      const result = db.prepare(`
        SELECT COUNT(*) as count FROM tasks
        WHERE id = ? AND (
          created_by = ? OR assigned_to = ? OR team_id IN (
            SELECT team_id FROM team_members WHERE user_id = ?
          )
        )
      `).get(taskId, userId, userId, userId);

      return result.count > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check task access', error);
    }
  }

  /**
   * Check if user can modify task (creator only)
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @returns {boolean} True if user can modify
   */
  canModify(taskId, userId) {
    try {
      const result = db.prepare(`
        SELECT COUNT(*) as count FROM tasks
        WHERE id = ? AND created_by = ?
      `).get(taskId, userId);

      return result.count > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check task modify permission', error);
    }
  }

  /**
   * Get task intervals
   * @param {string} taskId - Task ID
   * @returns {Array} Array of intervals
   */
  getIntervals(taskId) {
    try {
      return db.prepare(`
        SELECT * FROM task_intervals 
        WHERE task_id = ? 
        ORDER BY created_at
      `).all(taskId);
    } catch (error) {
      throw new DatabaseError('Failed to fetch task intervals', error);
    }
  }

  /**
   * Create task intervals (split task)
   * @param {string} taskId - Task ID
   * @param {number} intervalCount - Number of intervals
   * @param {number} totalDuration - Total task duration
   * @returns {Array} Created intervals
   */
  createIntervals(taskId, intervalCount, totalDuration) {
    try {
      // Delete existing intervals
      db.prepare('DELETE FROM task_intervals WHERE task_id = ?').run(taskId);

      const intervalDuration = Math.ceil(totalDuration / intervalCount);
      const intervals = [];

      for (let i = 0; i < intervalCount; i++) {
        const intervalId = uuidv4();
        const duration = i === intervalCount - 1 
          ? totalDuration - (intervalDuration * (intervalCount - 1))
          : intervalDuration;

        db.prepare(`
          INSERT INTO task_intervals (id, task_id, duration)
          VALUES (?, ?, ?)
        `).run(intervalId, taskId, duration);

        intervals.push({
          id: intervalId,
          task_id: taskId,
          duration,
          scheduled_start: null,
          is_completed: false
        });
      }

      return intervals;
    } catch (error) {
      throw new DatabaseError('Failed to create task intervals', error);
    }
  }

  /**
   * Format task for API response
   * @param {Object} task - Task database object
   * @param {Array} intervals - Optional intervals array
   * @returns {Object} Formatted task object
   */
  formatForResponse(task, intervals = null) {
    if (!task) return null;

    const formatted = {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: new Date(task.due_date),
      estimatedDuration: task.estimated_duration,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assigned_to,
      assignedToName: task.assigned_to_name || null,
      teamId: task.team_id,
      teamName: task.team_name || null,
      createdBy: task.created_by,
      createdAt: new Date(task.created_at),
      updatedAt: task.updated_at ? new Date(task.updated_at) : null,
      tags: JSON.parse(task.tags || '[]')
    };

    if (intervals) {
      formatted.intervals = intervals.map(interval => ({
        id: interval.id,
        taskId: interval.task_id,
        duration: interval.duration,
        scheduledStart: interval.scheduled_start ? new Date(interval.scheduled_start) : null,
        isCompleted: Boolean(interval.is_completed)
      }));
    }

    return formatted;
  }
}

export default new TaskModel();
