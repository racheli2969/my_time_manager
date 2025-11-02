/**
 * Authentication Middleware
 * 
 * Provides authentication and authorization middleware for protected routes
 */

import { verifyToken } from '../config/jwt.js';
import UserModel from '../models/UserModel.js';
import { AuthenticationError, AuthorizationError, NotFoundError } from '../utils/errors.js';
import { ErrorMessages } from '../constants/index.js';

/**
 * Authenticate JWT token
 * Verifies token and attaches user to request object
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError(ErrorMessages.TOKEN_REQUIRED);
    }

    const decoded = verifyToken(token);
    const user = UserModel.findById(decoded.id);
    
    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    req.user = UserModel.formatForResponse(user);
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new AuthenticationError(ErrorMessages.INVALID_TOKEN));
    } else {
      next(err);
    }
  }
};

/**
 * Require specific role(s)
 * Must be used after authenticateToken middleware
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError(ErrorMessages.AUTH_REQUIRED));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError(ErrorMessages.INSUFFICIENT_PERMISSIONS));
    }
    
    next();
  };
};

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = UserModel.findById(decoded.id);
    
    req.user = user ? UserModel.formatForResponse(user) : null;
  } catch (err) {
    req.user = null;
  }
  
  next();
};
