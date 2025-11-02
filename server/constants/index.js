/**
 * Application Constants and Enums
 * 
 * Centralized constants to avoid magic strings/numbers throughout the codebase
 */

// User roles
export const UserRole = {
  USER: 'user',
  TEAM_MEMBER: 'team-member',
  ADMIN: 'admin'
};

// Task status
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

// Task priority
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Schedule conflict types
export const ConflictType = {
  NO_AVAILABLE_SLOT: 'no_available_slot',
  DEADLINE_MISS: 'deadline_miss',
  SCHEDULING_ERROR: 'scheduling_error',
  OVERLAP: 'overlap'
};

// Event types
export const EventType = {
  PERSONAL: 'personal',
  HOLIDAY: 'holiday',
  MEETING: 'meeting',
  BREAK: 'break'
};

// Efficiency curves
export const EfficiencyCurve = {
  NORMAL: 'normal',
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening'
};

// Default values
export const Defaults = {
  WORK_START: '09:00',
  WORK_END: '17:00',
  WORKING_DAYS: [1, 2, 3, 4, 5], // Monday to Friday
  MAX_TASK_DURATION: 180, // 3 hours in minutes
  BREAK_DURATION: 15, // minutes
  WORK_BUFFER_MINUTES: 30,
  AUTO_SPLIT_LONG_TASKS: true,
  ALLOW_WEEKEND_SCHEDULING: false,
  EFFICIENCY_CURVE: EfficiencyCurve.NORMAL,
  PAGE_SIZE: 6,
  TIME_SLOT_INTERVAL: 15 // minutes
};

// Password requirements
export const PasswordRequirements = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 128
};

// Token expiration
export const TokenExpiration = {
  ACCESS_TOKEN: '24h',
  REFRESH_TOKEN: '7d'
};

// HTTP Status Codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Error messages
export const ErrorMessages = {
  // Authentication
  AUTH_REQUIRED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_REQUIRED: 'Access token required',
  INVALID_TOKEN: 'Invalid or expired token',
  REFRESH_TOKEN_REQUIRED: 'Refresh token required',
  
  // Validation
  VALIDATION_ERROR: 'Validation error',
  INVALID_EMAIL: 'Invalid email format',
  PASSWORD_TOO_SHORT: `Password must be at least ${PasswordRequirements.MIN_LENGTH} characters long`,
  REQUIRED_FIELD: 'This field is required',
  
  // Users
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS: 'User with this email already exists',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  
  // Tasks
  TASK_NOT_FOUND: 'Task not found or access denied',
  
  // Teams
  TEAM_NOT_FOUND: 'Team not found or access denied',
  NOT_TEAM_ADMIN: 'Only team admin can perform this action',
  
  // Schedule
  SCHEDULE_ENTRY_NOT_FOUND: 'Schedule entry not found or access denied',
  CONFLICT_NOT_FOUND: 'Conflict not found',
  
  // Events
  EVENT_NOT_FOUND: 'Event not found',
  
  // General
  INTERNAL_ERROR: 'Internal server error',
  ACCESS_DENIED: 'Access denied',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions'
};

// Success messages
export const SuccessMessages = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  CONFLICT_RESOLVED: 'Conflict resolved successfully'
};

// Validation regex patterns
export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TIME: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

export default {
  UserRole,
  TaskStatus,
  TaskPriority,
  ConflictType,
  EventType,
  EfficiencyCurve,
  Defaults,
  PasswordRequirements,
  TokenExpiration,
  HttpStatus,
  ErrorMessages,
  SuccessMessages,
  ValidationPatterns
};
