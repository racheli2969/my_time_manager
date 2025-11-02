/**
 * User Model
 * 
 * Handles all database operations for users
 */

import db from '../database.js';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseError, NotFoundError } from '../utils/errors.js';
import { Defaults, UserRole } from '../constants/index.js';

class UserModel {
  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Object|null} User object or null
   */
  findById(userId) {
    try {
      return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID', error);
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null
   */
  findByEmail(email) {
    try {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    } catch (error) {
      throw new DatabaseError('Failed to find user by email', error);
    }
  }

  /**
   * Find user by Google ID
   * @param {string} googleId - Google user ID
   * @returns {Object|null} User object or null
   */
  findByGoogleId(googleId) {
    try {
      return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
    } catch (error) {
      throw new DatabaseError('Failed to find user by Google ID', error);
    }
  }

  /**
   * Find user by email or Google ID
   * @param {string} email - User email
   * @param {string} googleId - Google user ID
   * @returns {Object|null} User object or null
   */
  findByEmailOrGoogleId(email, googleId) {
    try {
      return db.prepare('SELECT * FROM users WHERE email = ? OR google_id = ?')
        .get(email.toLowerCase(), googleId);
    } catch (error) {
      throw new DatabaseError('Failed to find user', error);
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Object} Created user
   */
  create(userData) {
    try {
      const userId = uuidv4();
      const {
        name,
        email,
        password = null,
        googleId = null,
        profilePicture = null,
        role = UserRole.USER,
        workingHoursStart = Defaults.WORK_START,
        workingHoursEnd = Defaults.WORK_END,
        workingDays = Defaults.WORKING_DAYS
      } = userData;

      db.prepare(`
        INSERT INTO users (
          id, name, email, password, google_id, profile_picture, role,
          working_hours_start, working_hours_end, working_days
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        name.trim(),
        email.toLowerCase(),
        password,
        googleId,
        profilePicture,
        role,
        workingHoursStart,
        workingHoursEnd,
        JSON.stringify(workingDays)
      );

      return this.findById(userId);
    } catch (error) {
      if (error.message?.includes('UNIQUE constraint')) {
        throw new DatabaseError('User with this email already exists');
      }
      throw new DatabaseError('Failed to create user', error);
    }
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated user
   */
  update(userId, updates) {
    try {
      const fields = [];
      const values = [];

      const allowedFields = {
        name: 'name',
        email: 'email',
        password: 'password',
        profilePicture: 'profile_picture',
        role: 'role',
        workingHoursStart: 'working_hours_start',
        workingHoursEnd: 'working_hours_end',
        workingDays: 'working_days',
        refreshToken: 'refresh_token'
      };

      Object.entries(updates).forEach(([key, value]) => {
        const dbField = allowedFields[key];
        if (dbField) {
          fields.push(`${dbField} = ?`);
          // Stringify array fields
          if (key === 'workingDays' && Array.isArray(value)) {
            values.push(JSON.stringify(value));
          } else if (key === 'email') {
            values.push(value.toLowerCase());
          } else {
            values.push(value);
          }
        }
      });

      if (fields.length === 0) {
        return this.findById(userId);
      }

      values.push(userId);

      db.prepare(`
        UPDATE users SET ${fields.join(', ')}
        WHERE id = ?
      `).run(...values);

      return this.findById(userId);
    } catch (error) {
      throw new DatabaseError('Failed to update user', error);
    }
  }

  /**
   * Update user's refresh token
   * @param {string} userId - User ID
   * @param {string} refreshToken - New refresh token
   */
  updateRefreshToken(userId, refreshToken) {
    try {
      db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, userId);
    } catch (error) {
      throw new DatabaseError('Failed to update refresh token', error);
    }
  }

  /**
   * Find user by refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object|null} User object or null
   */
  findByRefreshToken(refreshToken) {
    try {
      return db.prepare('SELECT * FROM users WHERE refresh_token = ?').get(refreshToken);
    } catch (error) {
      throw new DatabaseError('Failed to find user by refresh token', error);
    }
  }

  /**
   * Get all users (for team assignment, etc.)
   * @returns {Array} Array of users
   */
  findAll() {
    try {
      return db.prepare(`
        SELECT id, name, email, role, profile_picture,
               working_hours_start, working_hours_end, working_days
        FROM users
        ORDER BY name
      `).all();
    } catch (error) {
      throw new DatabaseError('Failed to fetch users', error);
    }
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {boolean} True if deleted
   */
  delete(userId) {
    try {
      const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
      return result.changes > 0;
    } catch (error) {
      throw new DatabaseError('Failed to delete user', error);
    }
  }

  /**
   * Check if user exists
   * @param {string} userId - User ID
   * @returns {boolean} True if exists
   */
  exists(userId) {
    try {
      const result = db.prepare('SELECT COUNT(*) as count FROM users WHERE id = ?').get(userId);
      return result.count > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check user existence', error);
    }
  }

  /**
   * Format user object for API response (remove sensitive data)
   * @param {Object} user - User database object
   * @returns {Object} Formatted user object
   */
  formatForResponse(user) {
    if (!user) return null;

    const workingDays = user.working_days ? JSON.parse(user.working_days) : Defaults.WORKING_DAYS;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profile_picture || null,
      workingHours: {
        start: user.working_hours_start || Defaults.WORK_START,
        end: user.working_hours_end || Defaults.WORK_END,
        daysOfWeek: workingDays
      },
      createdAt: user.created_at ? new Date(user.created_at) : null
    };
  }
}

export default new UserModel();
