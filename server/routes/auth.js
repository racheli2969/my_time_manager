import { Router } from 'express';
import { hash, compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { generateAccessToken, generateRefreshToken } from '../config/jwt.js';
import { OAuth2Client } from 'google-auth-library';

const router = Router();

// Initialize Google OAuth client
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);
    const userId = uuidv4();

    // Create user with default working hours
    db.prepare(
      'INSERT INTO users (id, name, email, password, role, working_hours_start, working_hours_end, working_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(userId, name, email, hashedPassword, role, '09:00', '17:00', JSON.stringify([1, 2, 3, 4, 5]));

    // Generate tokens
    const accessToken = generateAccessToken({ id: userId });
    const refreshToken = generateRefreshToken({ id: userId });

    // Store refresh token in database
    db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, userId);

    res.status(201).json({
      accessToken,
      refreshToken,
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

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

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

    // Generate tokens
    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Store refresh token in database
    db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, user.id);

    res.json({
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
          daysOfWeek: user.working_days ? JSON.parse(user.working_days) : [1, 2, 3, 4, 5]
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
