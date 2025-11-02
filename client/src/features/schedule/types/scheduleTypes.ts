/**
 * Schedule Types
 * Type definitions for schedule feature
 */

export interface ScheduleGenerationOptions {
  startDate?: string;
  endDate?: string;
  respectPersonalEvents: boolean;
  allowManualOverride: boolean;
  prioritizeUrgentTasks: boolean;
  optimizeForEfficiency: boolean;
}
