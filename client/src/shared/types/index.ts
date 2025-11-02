/**
 * Shared Types Module
 * Central location for commonly used types across the application
 */

export type ViewType = 'tasks' | 'schedule' | 'calendar' | 'teams' | 'payments' | 'profile';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export type SubscriptionTier = 'free' | 'paid' | 'pro';

export interface DialogState {
  message: string;
  redirect?: boolean;
  title?: string;
}
