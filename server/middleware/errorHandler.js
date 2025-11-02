/**
 * Centralized Error Handling Middleware
 * 
 * Handles all errors thrown in the application and formats consistent responses
 */

import { AppError } from '../utils/errors.js';
import { HttpStatus } from '../constants/index.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Handle operational errors (expected errors)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      error: 'Invalid token',
      details: err.message
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      error: 'Token expired',
      details: 'Please refresh your token or log in again'
    });
  }

  // Handle database errors
  if (err.code === 'SQLITE_CONSTRAINT' || err.message?.includes('UNIQUE constraint')) {
    return res.status(HttpStatus.CONFLICT).json({
      error: 'Resource already exists',
      details: 'A record with this information already exists'
    });
  }

  // Handle validation errors from libraries
  if (err.name === 'ValidationError') {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error: 'Validation error',
      details: err.errors || err.message
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Return generic error response for unexpected errors
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack
    })
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(HttpStatus.NOT_FOUND).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
};

export default {
  errorHandler,
  asyncHandler,
  notFoundHandler
};
