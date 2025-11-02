/**
 * Validation Utility Functions
 */

import { ValidationPatterns, PasswordRequirements } from '../constants/index.js';
import { ValidationError } from './errors.js';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required');
  }
  
  if (!ValidationPatterns.EMAIL.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  
  return true;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required');
  }
  
  if (password.length < PasswordRequirements.MIN_LENGTH) {
    throw new ValidationError(
      `Password must be at least ${PasswordRequirements.MIN_LENGTH} characters long`
    );
  }
  
  if (password.length > PasswordRequirements.MAX_LENGTH) {
    throw new ValidationError(
      `Password must not exceed ${PasswordRequirements.MAX_LENGTH} characters`
    );
  }
  
  return true;
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @throws {ValidationError} If any required field is missing
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new ValidationError('Missing required fields', {
      missingFields,
      message: `The following fields are required: ${missingFields.join(', ')}`
    });
  }
  
  return true;
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid
 */
export const validateUUID = (uuid) => {
  return ValidationPatterns.UUID.test(uuid);
};

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid
 * @throws {ValidationError} If invalid
 */
export const validateTimeFormat = (time) => {
  if (!ValidationPatterns.TIME.test(time)) {
    throw new ValidationError(`Invalid time format: ${time}. Expected HH:MM format`);
  }
  return true;
};

/**
 * Validate date is in future
 * @param {Date|string} date - Date to validate
 * @returns {boolean} True if in future
 */
export const isDateInFuture = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj > new Date();
};

/**
 * Sanitize string input (remove extra whitespace, trim)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Validate enum value
 * @param {any} value - Value to validate
 * @param {Object} enumObj - Enum object
 * @param {string} fieldName - Name of field for error message
 * @throws {ValidationError} If invalid
 */
export const validateEnum = (value, enumObj, fieldName) => {
  const validValues = Object.values(enumObj);
  if (!validValues.includes(value)) {
    throw new ValidationError(
      `Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`
    );
  }
  return true;
};

export default {
  validateEmail,
  validatePassword,
  validateRequiredFields,
  validateUUID,
  validateTimeFormat,
  isDateInFuture,
  sanitizeString,
  validateEnum
};
