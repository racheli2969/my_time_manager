import { Router } from 'express';
import { hash, compare } from 'bcryptjs';

import pkg from 'jsonwebtoken';
const { sign } = pkg;

import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import JWT_SECRET from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const router = Router();

// Initialize Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Validate Google Client ID on startup
if (!GOOGLE_CLIENT_ID) {
  console.warn('Warning: GOOGLE_CLIENT_ID environment variable is not set. Google authentication will not work.');
}

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);
    const userId = uuidv4();

    // Create user
    db.prepare(`
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, name, email, hashedPassword, role);

    // Generate token
    const token = sign({ id: userId }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        name,
        email,
        role,
        workingHours: {
          start: '09:00',
          end: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5]
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workingHours: {
          start: user.working_hours_start,
          end: user.working_hours_end,
          daysOfWeek: JSON.parse(user.working_days)
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Google OAuth Authentication Route
 * 
 * This route handles authentication via Google OAuth 2.0.
 * It verifies the Google JWT token and either logs in an existing user
 * or creates a new user account if they don't exist.
 * 
 * @route POST /auth/google
 * @param {string} credential - JWT token from Google
 * @returns {Object} Authentication response with user data and JWT token
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    if (!GOOGLE_CLIENT_ID || !googleClient) {
      console.error('Google Client ID not configured');
      return res.status(500).json({ error: 'Google authentication not configured' });
    }

    // Verify the Google token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      // Handle specific error types
      if (error.message && error.message.includes('Token expired')) {
        return res.status(401).json({ error: 'Google token has expired. Please sign in again.' });
      }
      return res.status(400).json({ error: 'Invalid Google credential' });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google credential payload' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required from Google' });
    }

    // Check if user already exists by email
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user) {
      // Update Google ID if not set and update profile picture
      if (!user.google_id) {
        db.prepare('UPDATE users SET google_id = ?, profile_picture = ? WHERE id = ?')
          .run(googleId, picture || null, user.id);
        user.google_id = googleId;
        user.profile_picture = picture;
      } else {
        // Update profile picture even if Google ID exists
        db.prepare('UPDATE users SET profile_picture = ? WHERE id = ?')
          .run(picture || null, user.id);
        user.profile_picture = picture;
      }
      
      // Ensure working hours are set (for existing users who might not have them)
      if (!user.working_hours_start || !user.working_hours_end || !user.working_days) {
        db.prepare('UPDATE users SET working_hours_start = ?, working_hours_end = ?, working_days = ? WHERE id = ?')
          .run('09:00', '17:00', '[1,2,3,4,5]', user.id);
        user.working_hours_start = '09:00';
        user.working_hours_end = '17:00';
        user.working_days = '[1,2,3,4,5]';
      }
    } else {
      // Create new user
      const userId = uuidv4();
      
      try {
        db.prepare(`
          INSERT INTO users (id, name, email, google_id, profile_picture, role, working_hours_start, working_hours_end, working_days)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(userId, name, email, googleId, picture || null, 'user', '09:00', '17:00', '[1,2,3,4,5]');

        // Fetch the created user
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        
        if (!user) {
          throw new Error('Failed to retrieve created user');
        }
      } catch (dbError) {
        console.error('Database error during user creation:', dbError);
        return res.status(500).json({ error: 'Failed to create user account' });
      }
    }

    // Generate JWT token
    const token = sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profile_picture,
        workingHours: {
          start: user.working_hours_start,
          end: user.working_hours_end,
          daysOfWeek: JSON.parse(user.working_days)
        }
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;