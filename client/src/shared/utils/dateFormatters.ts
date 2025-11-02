/**
 * Date Formatting Utilities
 * Common date formatting functions used across the application
 */

import { format } from 'date-fns';

/**
 * Format a date to a short readable format (e.g., "Jan 15, 2024")
 */
export const formatDateShort = (date: Date | string): string => {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a date to a long readable format (e.g., "January 15, 2024")
 */
export const formatDateLong = (date: Date | string): string => {
  try {
    return format(new Date(date), 'MMMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format a time from Date object (e.g., "2:30 PM")
 */
export const formatTime = (date: Date | string): string => {
  try {
    return format(new Date(date), 'h:mm a');
  } catch {
    return 'Invalid time';
  }
};

/**
 * Format date and time together (e.g., "Jan 15, 2024 2:30 PM")
 */
export const formatDateTime = (date: Date | string): string => {
  try {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid date/time';
  }
};
