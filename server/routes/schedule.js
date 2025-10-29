import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import ScheduleService from '../services/scheduleService.js';

const router = express.Router();

// Generate intelligent schedule

router.post('/', authenticateToken,async (req, res) => { 
  console.log("Generate schedule request received");

 try {
    const {
      startDate,
      endDate,
      respectPersonalEvents = true,
      allowManualOverride = true,
      prioritizeUrgentTasks = true,
      optimizeForEfficiency = true
    } = req.body;

    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      respectPersonalEvents,
      allowManualOverride,
      prioritizeUrgentTasks,
      optimizeForEfficiency
    };

    const result = await ScheduleService.generateSchedule(req.user.id, options);
    console.log("result:", result);
    
    res.json({
      scheduleEntries: result.scheduleEntries,
      conflicts: result.conflicts,
      stats: result.stats,
      message: `Generated schedule with ${result.scheduleEntries.length} entries and ${result.conflicts.length} conflicts`
    });
  } catch (error) {
    console.error('Generate schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get schedule entries
router.get('/', authenticateToken, (req, res) => {
  try {
    const entries = db.prepare(`
      SELECT * FROM schedule_entries 
      WHERE user_id = ? 
      ORDER BY start_time
    `).all(req.user.id);

    const scheduleEntries = entries.map(entry => ({
      id: entry.id,
      taskId: entry.task_id,
      intervalId: entry.interval_id || undefined,
      start: new Date(entry.start_time),
      end: new Date(entry.end_time),
      title: entry.title,
      priority: entry.priority,
      isManual: Boolean(entry.is_manual),
      isLocked: Boolean(entry.is_locked)
    }));

    res.json(scheduleEntries);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update schedule entry (manual scheduling)
router.put('/entry/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end, isLocked, isManual } = req.body;

    const updates = {};
    if (start) updates.start = new Date(start);
    if (end) updates.end = new Date(end);
    if (isLocked !== undefined) updates.isLocked = isLocked;
    if (isManual !== undefined) updates.isManual = isManual;

    const updatedEntry = await ScheduleService.updateScheduleEntry(id, req.user.id, updates);
    res.json(updatedEntry);
  } catch (error) {
    console.error('Update schedule entry error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get schedule conflicts
router.get('/conflicts', authenticateToken, (req, res) => {
  try {
    const conflicts = db.prepare(`
      SELECT * FROM schedule_conflicts 
      WHERE user_id = ? AND is_resolved = 0
      ORDER BY created_at DESC
    `).all(req.user.id);

    const formattedConflicts = conflicts.map(conflict => ({
      id: conflict.id,
      userId: conflict.user_id,
      scheduleEntryId: conflict.schedule_entry_id || undefined,
      conflictType: conflict.conflict_type,
      conflictDetails: conflict.conflict_details,
      isResolved: Boolean(conflict.is_resolved),
      resolutionAction: conflict.resolution_action || undefined,
      createdAt: new Date(conflict.created_at)
    }));

    res.json(formattedConflicts);
  } catch (error) {
    console.error('Get conflicts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve schedule conflict
router.put('/conflicts/:id/resolve', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionAction } = req.body;

    const conflict = db.prepare(`
      SELECT * FROM schedule_conflicts WHERE id = ? AND user_id = ?
    `).get(id, req.user.id);

    if (!conflict) {
      return res.status(404).json({ error: 'Conflict not found' });
    }

    db.prepare(`
      UPDATE schedule_conflicts 
      SET is_resolved = 1, resolution_action = ?
      WHERE id = ? AND user_id = ?
    `).run(resolutionAction || 'Manual resolution', id, req.user.id);

    res.json({ message: 'Conflict resolved successfully' });
  } catch (error) {
    console.error('Resolve conflict error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const preferences = await ScheduleService.getPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const updatedPreferences = await ScheduleService.updatePreferences(req.user.id, req.body);
    res.json(updatedPreferences);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add personal event
router.post('/events', authenticateToken, (req, res) => {
  try {
    const {
      title,
      description,
      start,
      end,
      isRecurring = false,
      recurrencePattern,
      eventType = 'personal'
    } = req.body;

    const eventId = uuidv4();
    
    db.prepare(`
      INSERT INTO personal_events (
        id, user_id, title, description, start_time, end_time, 
        is_recurring, recurrence_pattern, event_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId, req.user.id, title, description || null,
      new Date(start).toISOString(), new Date(end).toISOString(),
      isRecurring, recurrencePattern || null, eventType
    );

    const event = {
      id: eventId,
      userId: req.user.id,
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      isRecurring,
      recurrencePattern,
      eventType
    };

    res.json(event);
  } catch (error) {
    console.error('Add personal event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get personal events
router.get('/events', authenticateToken, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM personal_events WHERE user_id = ?';
    const params = [req.user.id];

    if (startDate && endDate) {
      query += ' AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))';
      params.push(startDate, endDate, startDate, endDate);
    }

    query += ' ORDER BY start_time';

    const events = db.prepare(query).all(...params);

    const formattedEvents = events.map(event => ({
      id: event.id,
      userId: event.user_id,
      title: event.title,
      description: event.description,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      isRecurring: Boolean(event.is_recurring),
      recurrencePattern: event.recurrence_pattern,
      eventType: event.event_type
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Get personal events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete personal event
router.delete('/events/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const event = db.prepare(`
      SELECT * FROM personal_events WHERE id = ? AND user_id = ?
    `).get(id, req.user.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.prepare('DELETE FROM personal_events WHERE id = ? AND user_id = ?').run(id, req.user.id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete personal event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;