import { Router } from 'express';
import { hash, compare } from 'bcryptjs';

import pkg from 'jsonwebtoken';
const { sign } = pkg;

import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import  JWT_SECRET from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const router = Router();

// Initialize Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

    if (!GOOGLE_CLIENT_ID) {
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
      }
    } else {
      // Create new user
      const userId = uuidv4();
      
      db.prepare(`
        INSERT INTO users (id, name, email, google_id, profile_picture, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, name, email, googleId, picture || null, 'user');

      // Fetch the created user
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
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