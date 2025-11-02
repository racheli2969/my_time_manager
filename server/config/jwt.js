import 'dotenv/config';
import pkg from 'jsonwebtoken';
import { config } from './appConfig.js';

const { sign, verify } = pkg;

// JWT Configuration from centralized config
const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = config.jwt.accessTokenExpiry;
const JWT_REFRESH_EXPIRES_IN = config.jwt.refreshTokenExpiry;

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload) => {
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  return verify(token, JWT_SECRET);
};

export { JWT_SECRET };
export default {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};