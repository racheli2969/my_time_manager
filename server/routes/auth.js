/**
 * Authentication Routes
 * 
 * This module handles all authentication-related endpoints including:
 * - User registration and login with email/password
 * - Google OAuth authentication
 * - JWT token refresh
 * - Security and validation for all auth flows
 * 
 * @requires express
 * @requires bcryptjs - For password hashing
 * @requires uuid - For generating unique user IDs
 * @requires google-auth-library - For Google OAuth verification
 */

import { Router } from 'express';
import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import db from '../database.js';
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js';

const router = Router();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * User Registration Endpoint
 * 
 * Creates a new user account with email/password authentication.
 * Validates input, hashes password, and generates JWT tokens.
 * 
 * @route POST /api/auth/register
 * @param {string} name - User's full name
 * @param {string} email - User's email address (must be unique)
 * @param {string} password - User's password (will be hashed)
 * @param {string} [role='user'] - User role (user/admin)
 * 
 * @returns {Object} Response with access/refresh tokens and user data
 * @returns {string} accessToken - JWT access token for API authentication
 * @returns {string} refreshToken - JWT refresh token for token renewal
 * @returns {Object} user - User profile information
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password with high cost factor for security
    const hashedPassword = await hash(password, 12);
    const userId = uuidv4();

    // Create user with default working hours and preferences
    const defaultWorkingHours = {
      start: '09:00',
      end: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
    };

    db.prepare(
      `INSERT INTO users (id, name, email, password, role, working_hours_start, working_hours_end, working_days) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      userId, 
      name.trim(), 
      email.toLowerCase(), 
      hashedPassword, 
      role, 
      defaultWorkingHours.start, 
      defaultWorkingHours.end, 
      JSON.stringify(defaultWorkingHours.daysOfWeek)
    );

    // Generate secure JWT tokens
    const accessToken = generateAccessToken({ id: userId, email: email.toLowerCase() });
    const refreshToken = generateRefreshToken({ id: userId });

    // Store refresh token securely in database
    db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, userId);

    // Return success response with tokens and user data (no sensitive info)
    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase(),
        role,
        workingHours: defaultWorkingHours
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

/**
 * User Login Endpoint
 * 
 * Authenticates user with email/password and returns JWT tokens.
 * Implements security best practices including rate limiting considerations.
 * 
 * @route POST /api/auth/login
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * 
 * @returns {Object} Response with access/refresh tokens and user data
 * @returns {string} accessToken - JWT access token for API authentication
 * @returns {string} refreshToken - JWT refresh token for token renewal
 * @returns {Object} user - User profile information (no sensitive data)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        details: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null
        }
      });
    }

    // Find user by email (case-insensitive)
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    
    // Generic error message to prevent user enumeration attacks
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password using bcrypt
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate new JWT tokens
    const accessToken = generateAccessToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Update refresh token in database (invalidates previous refresh token)
    db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, user.id);

    // Parse working hours from database
    const workingDays = user.working_days ? JSON.parse(user.working_days) : [1, 2, 3, 4, 5];

    // Return successful login response (exclude sensitive data)
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profile_picture || null,
        workingHours: {
          start: user.working_hours_start || '09:00',
          end: user.working_hours_end || '17:00',
          daysOfWeek: workingDays
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

/**
 * Google OAuth Authentication Endpoint
 * 
 * Handles Google Sign-In by verifying Google JWT tokens and creating/logging in users.
 * Supports both new user creation and existing user login.
 * 
 * Frontend Integration:
 * The frontend should send the Google JWT credential received from @react-oauth/google
 * in the request body as: { credential: "google-jwt-token" }
 * 
 * @route POST /api/auth/google
 * @param {string} credential - Google JWT token from OAuth flow
 * 
 * @returns {Object} Response with access/refresh tokens and user data
 * @returns {string} accessToken - JWT access token for API authentication
 * @returns {string} refreshToken - JWT refresh token for token renewal
 * @returns {Object} user - User profile information from Google + app data
 */
router.post('/google', async (req, res) => {
  console.log('🔍 Google authentication attempt:', {
    hasCredential: !!req.body.credential,
    credentialLength: req.body.credential ? req.body.credential.length : 0,
    clientId: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT_SET'
  });

  try {
    const { credential } = req.body;

    // Validate Google credential presence
    if (!credential) {
      console.log('❌ No credential provided in request body');
      return res.status(400).json({ 
        error: 'Google credential not provided',
        details: 'Expected JWT token from Google OAuth in request body'
      });
    }

    // Validate Google Client ID is configured
    if (!GOOGLE_CLIENT_ID) {
      console.log('❌ GOOGLE_CLIENT_ID not configured in environment');
      return res.status(500).json({ 
        error: 'Google authentication not configured',
        details: 'Server configuration error'
      });
    }

    console.log('🔐 Attempting to verify Google JWT token...');

    // Verify Google JWT token using the configured client
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    console.log('✅ Google token verified successfully:', {
      email: payload?.email,
      name: payload?.name,
      emailVerified: payload?.email_verified
    });

    if (!payload || !payload.email) {
      console.log('❌ Invalid payload from Google token verification');
      return res.status(400).json({ 
        error: 'Invalid Google token',
        details: 'Token verification failed or missing email'
      });
    }

    // Extract user data from Google payload
    const { 
      email, 
      name, 
      picture: profilePicture,
      email_verified,
      sub: googleId 
    } = payload;

    // Ensure email is verified by Google
    if (!email_verified) {
      console.log('❌ Google email not verified:', email);
      return res.status(400).json({ 
        error: 'Google email not verified',
        details: 'Please verify your email with Google before signing in'
      });
    }

    console.log('🔍 Checking if user exists in database:', email.toLowerCase());

    // Check if user already exists in our database (by email or google_id)
    let user;
    try {
      user = db.prepare('SELECT * FROM users WHERE email = ? OR google_id = ?').get(email.toLowerCase(), googleId);
    } catch (dbError) {
      console.log('❌ Database error while checking user:', dbError.message);
      console.log('❌ Full database error details:', dbError);
      return res.status(500).json({ 
        error: 'Database error',
        details: 'Failed to check user existence'
      });
    }

    if (!user) {
      console.log('👤 Creating new user from Google account:', email);
      
      // Create new user account for Google sign-in
      const userId = uuidv4();
      const defaultWorkingHours = {
        start: '09:00',
        end: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5]
      };

      try {
        db.prepare(
          `INSERT INTO users (id, name, email, password, google_id, profile_picture, role, working_hours_start, working_hours_end, working_days) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          userId, 
          name || 'Google User', 
          email.toLowerCase(), 
          null, // password is NULL for Google OAuth users
          googleId, 
          profilePicture || null, 
          'user', 
          defaultWorkingHours.start, 
          defaultWorkingHours.end, 
          JSON.stringify(defaultWorkingHours.daysOfWeek)
        );

        console.log('✅ New user created successfully:', userId);

        // Create user object for response
        user = { 
          id: userId, 
          name: name || 'Google User', 
          email: email.toLowerCase(), 
          google_id: googleId,
          profile_picture: profilePicture || null, 
          role: 'user',
          working_hours_start: defaultWorkingHours.start,
          working_hours_end: defaultWorkingHours.end,
          working_days: JSON.stringify(defaultWorkingHours.daysOfWeek)
        };
      } catch (dbError) {
        console.log('❌ Database error while creating user:', dbError.message);
        return res.status(500).json({ 
          error: 'Database error',
          details: 'Failed to create user account'
        });
      }
    } else {
      console.log('👤 Existing user found:', user.id);
      
      // Update existing user's profile picture if provided by Google
      if (profilePicture && profilePicture !== user.profile_picture) {
        try {
          db.prepare('UPDATE users SET profile_picture = ? WHERE id = ?').run(profilePicture, user.id);
          user.profile_picture = profilePicture;
          console.log('📸 Updated user profile picture');
        } catch (dbError) {
          console.log('⚠️  Warning: Could not update profile picture:', dbError.message);
          // Don't fail the authentication for this
        }
      }
    }

    console.log('🎫 Generating JWT tokens for user:', user.id);

    // Generate JWT tokens for our application
    let accessToken, refreshToken;
    try {
      accessToken = generateAccessToken({ 
        id: user.id, 
        email: user.email,
        role: user.role 
      });
      refreshToken = generateRefreshToken({ id: user.id });
      console.log('✅ JWT tokens generated successfully');
    } catch (tokenError) {
      console.log('❌ Error generating JWT tokens:', tokenError.message);
      return res.status(500).json({ 
        error: 'Token generation failed',
        details: 'Internal server error'
      });
    }

    // Store refresh token in database (invalidates previous refresh token)
    try {
      db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, user.id);
      console.log('💾 Refresh token stored in database');
    } catch (dbError) {
      console.log('❌ Error storing refresh token:', dbError.message);
      return res.status(500).json({ 
        error: 'Database error',
        details: 'Failed to store refresh token'
      });
    }

    // Parse working hours
    let workingDays;
    try {
      workingDays = user.working_days ? JSON.parse(user.working_days) : [1, 2, 3, 4, 5];
    } catch (parseError) {
      console.log('⚠️  Warning: Could not parse working days, using default');
      workingDays = [1, 2, 3, 4, 5];
    }

    const responseData = {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profile_picture,
        workingHours: {
          start: user.working_hours_start || '09:00',
          end: user.working_hours_end || '17:00',
          daysOfWeek: workingDays
        }
      }
    };

    console.log('🎉 Google authentication successful for user:', user.email);
    console.log('Response structure:', {
      hasAccessToken: !!responseData.accessToken,
      hasRefreshToken: !!responseData.refreshToken,
      hasUser: !!responseData.user,
      userId: responseData.user?.id,
      userEmail: responseData.user?.email
    });

    // Return successful authentication response
    res.json(responseData);

  } catch (error) {
    console.error('❌ Google authentication error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages based on error type
    if (error.message && error.message.includes('Token used too late')) {
      console.log('🕐 Google token expired');
      return res.status(400).json({ error: 'Google token expired. Please try signing in again.' });
    }
    
    if (error.message && error.message.includes('Invalid token')) {
      console.log('🚫 Invalid Google token format');
      return res.status(400).json({ error: 'Invalid Google token. Please try signing in again.' });
    }

    if (error.message && error.message.includes('audience')) {
      console.log('🎯 Token audience mismatch');
      return res.status(400).json({ error: 'Token verification failed. Please try again.' });
    }

    console.log('💥 Unhandled Google authentication error');
    res.status(500).json({ 
      error: 'Failed to authenticate with Google',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * JWT Token Refresh Endpoint
 * 
 * Exchanges a valid refresh token for new access and refresh tokens.
 * Implements token rotation for enhanced security.
 * 
 * Frontend Integration:
 * Send refresh token in Authorization header as: "Bearer <refresh-token>"
 * 
 * @route POST /api/auth/refresh
 * @header {string} Authorization - Bearer refresh token
 * 
 * @returns {Object} Response with new access/refresh tokens
 * @returns {string} accessToken - New JWT access token (replaces old one)
 * @returns {string} refreshToken - New JWT refresh token (replaces old one)
 */
router.post('/refresh', async (req, res) => {
  try {
    // Extract refresh token from Authorization header
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Refresh token required',
        details: 'Send refresh token in Authorization header as "Bearer <token>"'
      });
    }

    // Find user associated with this refresh token
    const user = db.prepare('SELECT * FROM users WHERE refresh_token = ?').get(refreshToken);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid or expired refresh token',
        details: 'Please log in again to obtain a new refresh token'
      });
    }

    // Generate new token pair (token rotation for security)
    const newAccessToken = generateAccessToken({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    // Update refresh token in database (invalidates old refresh token)
    db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(newRefreshToken, user.id);

    // Return new token pair
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error during token refresh' });
  }
});

export default router;
