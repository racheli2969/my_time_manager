import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';

/**
 * Intelligent Schedule Generation Service
 * This service creates optimized schedules based on user preferences, task priorities,
 * due dates, working hours, and personal events.
 */
class ScheduleService {
  /**
   * Generate an intelligent schedule for a user
   * @param {string} userId - User ID
   * @param {Object} options - Scheduling options
   * @returns {Object} - Generated schedule with conflicts
   */
  async generateSchedule(userId, options = {}) {
    try {
      const {
        startDate = new Date(),
        endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        respectPersonalEvents = true,
        allowManualOverride = true,
        prioritizeUrgentTasks = true,
        optimizeForEfficiency = true
      } = options;
      console.log("options", options);

      // Get user preferences
      const userPrefs = await this.getUserPreferences(userId);
      console.log("userPrefs: ", userPrefs);

      // Get user's incomplete tasks
      const tasks = await this.getUserTasks(userId);
      console.log("tasks: ", tasks);
      // Get personal events if enabled
      const personalEvents = respectPersonalEvents ? await this.getPersonalEvents(userId, startDate, endDate) : [];
      console.log("personalEvents: ", personalEvents);
      const lockedEntries = [];
      try {

        const columns = db.prepare("PRAGMA table_info(schedule_entries);").all();
        const columnNames = columns.map(c => c.name);

        if (!columnNames.includes("is_manual")) {
          db.exec(`ALTER TABLE schedule_entries ADD COLUMN is_manual BOOLEAN DEFAULT FALSE;`);
        }

        if (!columnNames.includes("is_locked")) {
          db.exec(`ALTER TABLE schedule_entries ADD COLUMN is_locked BOOLEAN DEFAULT FALSE;`);
        }
        console.log("Checked and added missing columns if needed");
        // Get existing schedule entries that are locked
        const lockedEntries = await this.getLockedScheduleEntries(userId);
        console.log("lockedEntries: ", lockedEntries);
      } catch (error) {
        console.error("Error fetching locked entries:", error);
        throw error;
      }
      // Clear old non-locked schedule entries
      await this.clearOldScheduleEntries(userId);
      console.log("cleared old schedule entries");
      // Generate the optimized schedule
      const { scheduleEntries, conflicts } = await this.createOptimizedSchedule({
        userId,
        tasks,
        personalEvents,
        lockedEntries,
        userPrefs,
        startDate,
        endDate,
        options
      });
      const scheduleEntriesPrepared = scheduleEntries.map(entry => ({
        ...entry,
        start_time: entry.start_time instanceof Date ? entry.start_time.toISOString() : entry.start_time,
        end_time: entry.end_time instanceof Date ? entry.end_time.toISOString() : entry.end_time,
        is_manual: entry.is_manual ? 1 : 0,
        is_locked: entry.is_locked ? 1 : 0,
        id: String(entry.id),
        task_id: entry.task_id != null ? String(entry.task_id) : null,
        interval_id: entry.interval_id != null ? String(entry.interval_id) : null,
        user_id: entry.user_id != null ? String(entry.user_id) : null,
        title: String(entry.title),
        priority: String(entry.priority)
      }));

      console.log("prepared schedule entries for saving", scheduleEntriesPrepared);
      // Save schedule entries to database
      await this.saveScheduleEntries(scheduleEntriesPrepared);
      console.log("saved schedule entries");

      // Save conflicts to database
      const conflictsPrepared = conflicts.map(conflict => ({
        ...conflict,
        is_resolved: conflict.is_resolved ? 1 : 0
      }));
      console.log("prepared conflicts for saving", conflictsPrepared);
      // Save conflicts to database
      await this.saveConflicts(conflictsPrepared);
      console.log("saved conflicts");
      return {
        scheduleEntries: scheduleEntries.map(this.formatScheduleEntry),
        conflicts: conflicts.map(this.formatConflict),
        stats: this.generateStats(scheduleEntries, tasks)
      };

    } catch (error) {
      console.error('Schedule generation error:', error);
      throw error;
    }
  }

  /**
   * Get user preferences or create default ones
   */
  async getUserPreferences(userId) {
    console.log("enter getUserPreferences");
    console.log("userId:", userId);

    let prefs;
    try {
      prefs = db.prepare(`
      SELECT * FROM user_preferences WHERE user_id = ?
    `).get(userId);
      console.log("prefs: ", prefs);
    } catch (err) {
      console.error("Error fetching preferences:", err);
      throw err;
    }

    if (!prefs) {
      // Create default preferences
      const defaultPrefs = {
        id: uuidv4(),
        user_id: userId,
        auto_split_long_tasks: true,
        max_task_duration: 180,
        break_duration: 15,
        work_buffer_minutes: 30,
        preferred_work_start: '09:00',
        preferred_work_end: '17:00',
        allow_weekend_scheduling: false,
        efficiency_curve: 'normal'
      };
      console.log("defaultPrefs: ", defaultPrefs);
      Object.entries(defaultPrefs).forEach(([key, value]) => {
        console.log(key, typeof value, value);
      });

      try {
        db.prepare(`
        INSERT INTO user_preferences (
          id, user_id, auto_split_long_tasks, max_task_duration, break_duration,
          work_buffer_minutes, preferred_work_start, preferred_work_end,
          allow_weekend_scheduling, efficiency_curve
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
          defaultPrefs.id, defaultPrefs.user_id, defaultPrefs.auto_split_long_tasks ? 1 : 0,
          defaultPrefs.max_task_duration, defaultPrefs.break_duration,
          defaultPrefs.work_buffer_minutes, defaultPrefs.preferred_work_start,
          defaultPrefs.preferred_work_end, defaultPrefs.allow_weekend_scheduling ? 1 : 0,
          defaultPrefs.efficiency_curve
        );
        prefs = defaultPrefs;
        console.log("Created default prefs: ", prefs);
      } catch (error) {
        console.error("Error inserting default preferences:", error);
        throw error;
      }
    }

    return prefs;
  }

  /**
   * Get user's incomplete tasks sorted by priority and due date
   */
  async getUserTasks(userId) {
    return db.prepare(`
      SELECT t.*, ti.id as interval_id, ti.duration as interval_duration, ti.is_completed as interval_completed
      FROM tasks t
      LEFT JOIN task_intervals ti ON t.id = ti.task_id AND ti.is_completed = 0
      WHERE (t.created_by = ? OR t.assigned_to = ?) AND t.status != 'completed'
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 4 
          WHEN 'high' THEN 3 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 1 
        END DESC,
        t.due_date ASC,
        t.created_at ASC
    `).all(userId, userId);
  }

  /**
   * Get personal events in the date range
   */
  async getPersonalEvents(userId, startDate, endDate) {
    return db.prepare(`
      SELECT * FROM personal_events 
      WHERE user_id = ? 
      AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))
      ORDER BY start_time
    `).all(userId, startDate.toISOString(), endDate.toISOString(),
      startDate.toISOString(), endDate.toISOString());
  }

  /**
   * Get locked schedule entries (manual or locked by user)
   */
  async getLockedScheduleEntries(userId) {
    return db.prepare(`
      SELECT * FROM schedule_entries 
      WHERE user_id = ? AND (is_locked = 1 OR is_manual = 1)
      ORDER BY start_time
    `).all(userId);
  }

  /**
   * Clear old non-locked schedule entries
   */
  async clearOldScheduleEntries(userId) {
    db.prepare(`
      DELETE FROM schedule_entries 
      WHERE user_id = ? AND is_locked = 0 AND is_manual = 0
    `).run(userId);
  }

  /**
   * Create optimized schedule using intelligent algorithm
   */
  async createOptimizedSchedule({
    userId, tasks, personalEvents, lockedEntries, userPrefs, startDate, endDate, options
  }) {
    const scheduleEntries = [];
    const conflicts = [];

    // Create time slots map for conflict detection
    const timeSlots = this.createTimeSlotsMap(personalEvents, lockedEntries, userPrefs);

    // Process tasks and create schedule entries
    for (const task of tasks) {
      try {
        const taskEntries = await this.scheduleTask({
          task,
          timeSlots,
          userPrefs,
          userId,
          startDate,
          endDate,
          options
        });

        scheduleEntries.push(...taskEntries.entries);
        conflicts.push(...taskEntries.conflicts);

        // Update timeSlots with new entries
        taskEntries.entries.forEach(entry => {
          this.addToTimeSlots(timeSlots, entry);
        });

      } catch (error) {
        conflicts.push({
          id: uuidv4(),
          user_id: userId,
          conflict_type: 'scheduling_error',
          conflict_details: `Failed to schedule task "${task.title}": ${error.message}`,
          is_resolved: false
        });
      }
    }

    return { scheduleEntries, conflicts };
  }

  /**
   * Schedule a single task optimally
   */
  async scheduleTask({ task, timeSlots, userPrefs, userId, startDate, endDate, options }) {
    const entries = [];
    const conflicts = [];

    // Determine if task should be split
    const shouldSplit = this.shouldSplitTask(task, userPrefs);
    const taskSegments = shouldSplit ? this.splitTaskIntoSegments(task, userPrefs) : [task];

    for (const segment of taskSegments) {
      const duration = segment.interval_id ? segment.interval_duration : segment.estimated_duration;

      // Find optimal time slot for this segment
      const timeSlot = this.findOptimalTimeSlot({
        duration,
        priority: segment.priority,
        dueDate: new Date(segment.due_date),
        timeSlots,
        userPrefs,
        startDate,
        endDate,
        options
      });

      if (!timeSlot) {
        conflicts.push({
          id: uuidv4(),
          user_id: userId,
          conflict_type: 'no_available_slot',
          conflict_details: `Cannot find suitable time slot for task "${task.title}" (${duration} minutes)`,
          is_resolved: false
        });
        continue;
      }

      // Check for deadline conflicts
      if (timeSlot.end > new Date(segment.due_date)) {
        conflicts.push({
          id: uuidv4(),
          user_id: userId,
          conflict_type: 'deadline_miss',
          conflict_details: `Task "${task.title}" scheduled after due date`,
          is_resolved: false
        });
      }

      // Create schedule entry
      const entry = {
        id: uuidv4(),
        task_id: task.id,
        interval_id: segment.interval_id || null,
        user_id: userId,
        start_time: timeSlot.start.toISOString(),
        end_time: timeSlot.end.toISOString(),
        title: segment.interval_id ? `${task.title} (Part ${segment.intervalIndex + 1})` : task.title,
        priority: task.priority,
        is_manual: false,
        is_locked: false
      };

      entries.push(entry);
    }

    return { entries, conflicts };
  }

  /**
   * Determine if a task should be split based on preferences and duration
   */
  shouldSplitTask(task, userPrefs) {
    if (!userPrefs.auto_split_long_tasks) return false;

    const duration = task.estimated_duration;
    return duration > userPrefs.max_task_duration || duration > 180; // 3 hours
  }

  /**
   * Split task into smaller segments
   */
  splitTaskIntoSegments(task, userPrefs) {
    // If task already has intervals, use them
    if (task.interval_id) {
      return [task];
    }

    const maxDuration = userPrefs.max_task_duration;
    const totalDuration = task.estimated_duration;

    if (totalDuration <= maxDuration) {
      return [task];
    }

    const numSegments = Math.ceil(totalDuration / maxDuration);
    const segmentDuration = Math.ceil(totalDuration / numSegments);
    const segments = [];

    for (let i = 0; i < numSegments; i++) {
      const remainingDuration = totalDuration - (i * segmentDuration);
      const actualDuration = Math.min(segmentDuration, remainingDuration);

      segments.push({
        ...task,
        estimated_duration: actualDuration,
        intervalIndex: i,
        isSegment: true
      });
    }

    return segments;
  }

  /**
   * Create time slots map for conflict detection
   */
  createTimeSlotsMap(personalEvents, lockedEntries, userPrefs) {
    const timeSlots = new Map();

    // Add personal events as blocked time
    personalEvents.forEach(event => {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      this.markTimeAsBlocked(timeSlots, start, end, 'personal_event');
    });

    // Add locked entries as blocked time
    lockedEntries.forEach(entry => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      this.markTimeAsBlocked(timeSlots, start, end, 'locked_entry');
    });

    return timeSlots;
  }

  /**
   * Find optimal time slot for a task segment
   */
  findOptimalTimeSlot({ duration, priority, dueDate, timeSlots, userPrefs, startDate, endDate, options }) {
    const workStart = this.parseTime(userPrefs.preferred_work_start);
    const workEnd = this.parseTime(userPrefs.preferred_work_end);
    const bufferMinutes = userPrefs.work_buffer_minutes;

    let currentDate = new Date(startDate);
    currentDate.setHours(workStart.hours, workStart.minutes, 0, 0);

    while (currentDate <= endDate) {
      // Skip weekends if not allowed
      if (!userPrefs.allow_weekend_scheduling && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(workStart.hours, workStart.minutes, 0, 0);
        continue;
      }

      // Find available slot in this day
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(workEnd.hours, workEnd.minutes, 0, 0);

      const slot = this.findSlotInDay(currentDate, dayEnd, duration, timeSlots, bufferMinutes);

      if (slot) {
        // Apply efficiency curve optimization
        const optimizedSlot = this.optimizeForEfficiency(slot, userPrefs.efficiency_curve, workStart, workEnd);
        return optimizedSlot;
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(workStart.hours, workStart.minutes, 0, 0);
    }

    return null; // No suitable slot found
  }

  /**
   * Find available slot within a day
   */
  findSlotInDay(dayStart, dayEnd, duration, timeSlots, bufferMinutes) {
    let currentTime = new Date(dayStart);

    while (currentTime.getTime() + duration * 60000 <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);

      if (this.isTimeSlotAvailable(currentTime, slotEnd, timeSlots, bufferMinutes)) {
        return { start: new Date(currentTime), end: slotEnd };
      }

      // Move forward by 15 minutes
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    return null;
  }

  /**
   * Check if time slot is available
   */
  isTimeSlotAvailable(start, end, timeSlots, bufferMinutes) {
    const bufferStart = new Date(start.getTime() - bufferMinutes * 60000);
    const bufferEnd = new Date(end.getTime() + bufferMinutes * 60000);

    // Check for conflicts in the buffered time range
    for (let time = bufferStart; time < bufferEnd; time.setMinutes(time.getMinutes() + 15)) {
      const timeKey = this.getTimeKey(time);
      if (timeSlots.has(timeKey)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Optimize slot timing based on efficiency curve
   */
  optimizeForEfficiency(slot, efficiencyCurve, workStart, workEnd) {
    // For now, return as-is. Can be enhanced with ML-based optimization
    return slot;
  }

  /**
   * Mark time range as blocked
   */
  markTimeAsBlocked(timeSlots, start, end, reason) {
    let current = new Date(start);
    while (current < end) {
      const timeKey = this.getTimeKey(current);
      timeSlots.set(timeKey, { blocked: true, reason });
      current.setMinutes(current.getMinutes() + 15);
    }
  }

  /**
   * Add schedule entry to time slots
   */
  addToTimeSlots(timeSlots, entry) {
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    this.markTimeAsBlocked(timeSlots, start, end, 'scheduled_task');
  }

  /**
   * Generate time key for conflict detection
   */
  getTimeKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}:${String(Math.floor(date.getMinutes() / 15) * 15).padStart(2, '0')}`;
  }

  /**
   * Parse time string to hours and minutes
   */
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  /**
   * Save schedule entries to database
   */
  async saveScheduleEntries(entries) {
    const stmt = db.prepare(`
      INSERT INTO schedule_entries (
        id, task_id, interval_id, user_id, start_time, end_time, title, priority, is_manual, is_locked
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    entries.forEach(entry => {
      stmt.run(
        entry.id, entry.task_id, entry.interval_id, entry.user_id,
        entry.start_time, entry.end_time, entry.title, entry.priority,
        entry.is_manual, entry.is_locked
      );
    });
  }

  /**
   * Save conflicts to database
   */
  async saveConflicts(conflicts) {
    const stmt = db.prepare(`
      INSERT INTO schedule_conflicts (
        id, user_id, schedule_entry_id, conflict_type, conflict_details, is_resolved
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    conflicts.forEach(conflict => {
      stmt.run(
        conflict.id, conflict.user_id, conflict.schedule_entry_id,
        conflict.conflict_type, conflict.conflict_details, conflict.is_resolved
      );
    });
  }

  /**
   * Format schedule entry for API response
   */
  formatScheduleEntry(entry) {
    return {
      id: entry.id,
      taskId: entry.task_id,
      intervalId: entry.interval_id || undefined,
      start: new Date(entry.start_time),
      end: new Date(entry.end_time),
      title: entry.title,
      priority: entry.priority,
      isManual: Boolean(entry.is_manual),
      isLocked: Boolean(entry.is_locked)
    };
  }

  /**
   * Format conflict for API response
   */
  formatConflict(conflict) {
    return {
      id: conflict.id,
      userId: conflict.user_id,
      scheduleEntryId: conflict.schedule_entry_id || undefined,
      conflictType: conflict.conflict_type,
      conflictDetails: conflict.conflict_details,
      isResolved: Boolean(conflict.is_resolved),
      resolutionAction: conflict.resolution_action || undefined
    };
  }

  /**
   * Generate scheduling statistics
   */
  generateStats(scheduleEntries, tasks) {
    return {
      totalTasks: tasks.length,
      scheduledTasks: scheduleEntries.length,
      totalDuration: scheduleEntries.reduce((sum, entry) => {
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        return sum + (end - start) / 60000; // minutes
      }, 0),
      averageTaskDuration: scheduleEntries.length > 0
        ? scheduleEntries.reduce((sum, entry) => {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          return sum + (end - start) / 60000;
        }, 0) / scheduleEntries.length
        : 0
    };
  }

  /**
   * Update schedule entry (for manual scheduling)
   */
  async updateScheduleEntry(entryId, userId, updates) {
    const entry = db.prepare(`
      SELECT * FROM schedule_entries WHERE id = ? AND user_id = ?
    `).get(entryId, userId);

    if (!entry) {
      throw new Error('Schedule entry not found or access denied');
    }

    const updateFields = [];
    const updateValues = [];

    if (updates.start) {
      updateFields.push('start_time = ?');
      updateValues.push(updates.start.toISOString());
    }

    if (updates.end) {
      updateFields.push('end_time = ?');
      updateValues.push(updates.end.toISOString());
    }

    if (updates.isLocked !== undefined) {
      updateFields.push('is_locked = ?');
      updateValues.push(updates.isLocked);
    }

    if (updates.isManual !== undefined) {
      updateFields.push('is_manual = ?');
      updateValues.push(updates.isManual);
    }

    if (updateFields.length === 0) {
      return this.formatScheduleEntry(entry);
    }

    updateValues.push(entryId, userId);

    db.prepare(`
      UPDATE schedule_entries 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `).run(...updateValues);

    const updatedEntry = db.prepare(`
      SELECT * FROM schedule_entries WHERE id = ? AND user_id = ?
    `).get(entryId, userId);

    return this.formatScheduleEntry(updatedEntry);
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId) {
    const prefs = await this.getUserPreferences(userId);
    return {
      id: prefs.id,
      userId: prefs.user_id,
      autoSplitLongTasks: Boolean(prefs.auto_split_long_tasks),
      maxTaskDuration: prefs.max_task_duration,
      breakDuration: prefs.break_duration,
      workBufferMinutes: prefs.work_buffer_minutes,
      preferredWorkStart: prefs.preferred_work_start,
      preferredWorkEnd: prefs.preferred_work_end,
      allowWeekendScheduling: Boolean(prefs.allow_weekend_scheduling),
      efficiencyCurve: prefs.efficiency_curve
    };
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, preferences) {
    const updateFields = [];
    const updateValues = [];

    Object.entries(preferences).forEach(([key, value]) => {
      if (key === 'userId' || key === 'id') return;

      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      updateFields.push(`${dbKey} = ?`);
      updateValues.push(value);
    });

    if (updateFields.length > 0) {
      updateValues.push(userId);

      db.prepare(`
        UPDATE user_preferences 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(...updateValues);
    }

    return this.getPreferences(userId);
  }
}

export default new ScheduleService();