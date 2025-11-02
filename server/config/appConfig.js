/**
 * Application Configuration
 * 
 * Centralized configuration management with validation
 */

import 'dotenv/config';
import { TokenExpiration } from '../constants/index.js';

/**
 * Validate that required environment variables are set
 */
const validateEnv = () => {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate environment on load
validateEnv();

/**
 * Application configuration object
 */
export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT) || 3001,
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },
  
  // Database configuration
  database: {
    path: process.env.DB_PATH || './data/taskmanagement.db',
    enableForeignKeys: true,
    logQueries: process.env.DB_LOG_QUERIES === 'true'
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiry: process.env.JWT_EXPIRES_IN || TokenExpiration.ACCESS_TOKEN,
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN || TokenExpiration.REFRESH_TOKEN
  },
  
  // Google OAuth configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    enabled: !!process.env.GOOGLE_CLIENT_ID
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Security headers
  security: {
    crossOriginOpenerPolicy: 'same-origin-allow-popups',
    crossOriginEmbedderPolicy: 'unsafe-none'
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: true,
    enableFile: process.env.ENABLE_FILE_LOGGING === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log'
  }
};

/**
 * Get configuration value by path
 * @param {string} path - Dot-separated path (e.g., 'server.port')
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Configuration value
 */
export const getConfig = (path, defaultValue = null) => {
  const keys = path.split('.');
  let value = config;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
};

/**
 * Check if a feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean} True if enabled
 */
export const isFeatureEnabled = (feature) => {
  const features = {
    googleAuth: config.google.enabled,
    // Add more feature flags as needed
  };
  
  return features[feature] || false;
};

export default config;
