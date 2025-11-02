/**
 * Response Formatting Utilities
 * 
 * Standardizes API responses across all endpoints
 */

import { HttpStatus } from '../constants/index.js';

/**
 * Format success response
 * @param {any} data - Response data
 * @param {string} message - Optional success message
 * @returns {Object} Formatted response
 */
export const successResponse = (data, message = null) => {
  const response = { success: true };
  
  if (message) {
    response.message = message;
  }
  
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  
  return response;
};

/**
 * Format error response
 * @param {string} error - Error message
 * @param {any} details - Optional error details
 * @returns {Object} Formatted error response
 */
export const errorResponse = (error, details = null) => {
  const response = { success: false, error };
  
  if (details) {
    response.details = details;
  }
  
  return response;
};

/**
 * Format paginated response
 * @param {Array} items - Array of items
 * @param {number} page - Current page number
 * @param {number} pageSize - Items per page
 * @param {number} totalCount - Total item count
 * @returns {Object} Formatted paginated response
 */
export const paginatedResponse = (items, page, pageSize, totalCount) => {
  return {
    success: true,
    data: items,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNext: page * pageSize < totalCount,
      hasPrevious: page > 1
    }
  };
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Optional message
 */
export const sendSuccess = (res, data, statusCode = HttpStatus.OK, message = null) => {
  res.status(statusCode).json(successResponse(data, message));
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} details - Optional error details
 */
export const sendError = (res, error, statusCode = HttpStatus.INTERNAL_SERVER_ERROR, details = null) => {
  res.status(statusCode).json(errorResponse(error, details));
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {any} data - Created resource data
 * @param {string} message - Optional message
 */
export const sendCreated = (res, data, message = 'Created successfully') => {
  sendSuccess(res, data, HttpStatus.CREATED, message);
};

/**
 * Send no content response (204)
 * @param {Object} res - Express response object
 */
export const sendNoContent = (res) => {
  res.status(HttpStatus.NO_CONTENT).send();
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
  sendSuccess,
  sendError,
  sendCreated,
  sendNoContent
};
