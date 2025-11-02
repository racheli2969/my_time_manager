/**
 * Custom Error Classes
 * 
 * Provides structured error handling throughout the application
 */

import { HttpStatus } from '../constants/index.js';

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(message, statusCode = HttpStatus.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 400
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, HttpStatus.BAD_REQUEST, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error - 401
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, HttpStatus.UNAUTHORIZED);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error - 403
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, HttpStatus.FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error - 409
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT);
    this.name = 'ConflictError';
  }
}

/**
 * Database Error - 500
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError
};
