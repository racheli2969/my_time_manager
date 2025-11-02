/**
 * Date and Time Utility Functions
 */

/**
 * Parse time string (HH:MM) to hours and minutes object
 * @param {string} timeString - Time in HH:MM format
 * @returns {{hours: number, minutes: number}}
 */
export const parseTime = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

/**
 * Format date to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
export const toISOString = (date) => {
  if (date instanceof Date) {
    return date.toISOString();
  }
  return new Date(date).toISOString();
};

/**
 * Check if date is weekend
 * @param {Date} date - Date to check
 * @returns {boolean} True if weekend
 */
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Add minutes to a date
 * @param {Date} date - Starting date
 * @param {number} minutes - Minutes to add
 * @returns {Date} New date with minutes added
 */
export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Days to add
 * @returns {Date} New date with days added
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get time key for conflict detection (rounds to 15-minute intervals)
 * @param {Date} date - Date to get key for
 * @returns {string} Time key in format YYYY-MM-DD_HH:MM
 */
export const getTimeKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(Math.floor(date.getMinutes() / 15) * 15).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}:${minutes}`;
};

/**
 * Calculate duration between two dates in minutes
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {number} Duration in minutes
 */
export const getDurationInMinutes = (start, end) => {
  return Math.round((end - start) / 60000);
};

/**
 * Set time on a date object
 * @param {Date} date - Date to modify
 * @param {number} hours - Hours (0-23)
 * @param {number} minutes - Minutes (0-59)
 * @returns {Date} New date with time set
 */
export const setTime = (date, hours, minutes) => {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

export default {
  parseTime,
  toISOString,
  isWeekend,
  addMinutes,
  addDays,
  getTimeKey,
  getDurationInMinutes,
  setTime
};
