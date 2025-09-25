export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'team-member' | 'admin';
  workingHours: {
    start: string;
    end: string;
    daysOfWeek: number[];
  };
  teams: string[];
}

export interface Task {
  start: Date;
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  estimatedDuration: number; // in minutes
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo?: string;
  teamId?: string;
  createdBy: string;
  createdAt: Date;
  intervals?: TaskInterval[];
  tags: string[];
}

export interface TaskInterval {
  id: string;
  taskId: string;
  duration: number;
  scheduledStart?: Date;
  isCompleted: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  adminId: string;
  createdAt: Date;
}

export interface ScheduleEntry {
  id: string;
  taskId: string;
  intervalId?: string;
  start: Date;
  end: Date;
  title: string;
  priority: Task['priority'];
  isManual?: boolean;
  isLocked?: boolean;
}

export interface UserPreferences {
  id: string;
  userId: string;
  autoSplitLongTasks: boolean;
  maxTaskDuration: number; // in minutes
  breakDuration: number; // in minutes
  workBufferMinutes: number; // buffer time around tasks
  preferredWorkStart: string; // HH:MM format
  preferredWorkEnd: string; // HH:MM format
  allowWeekendScheduling: boolean;
  efficiencyCurve: 'morning' | 'afternoon' | 'evening' | 'normal';
}

export interface PersonalEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  isRecurring: boolean;
  recurrencePattern?: string;
  eventType: 'personal' | 'meeting' | 'appointment' | 'break' | 'holiday';
}

export interface ScheduleConflict {
  id: string;
  userId: string;
  scheduleEntryId?: string;
  conflictType: 'overlap' | 'deadline_miss' | 'worktime_violation' | 'preference_violation';
  conflictDetails: string;
  isResolved: boolean;
  resolutionAction?: string;
}

export interface ScheduleGenerationOptions {
  startDate?: Date;
  endDate?: Date;
  respectPersonalEvents: boolean;
  allowManualOverride: boolean;
  prioritizeUrgentTasks: boolean;
  optimizeForEfficiency: boolean;
}