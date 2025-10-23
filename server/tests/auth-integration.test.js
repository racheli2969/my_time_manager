/**
 * Authentication Integration Tests
 * 
 * Comprehensive tests for the authentication system including:
 * - Traditional email/password login and registration
 * - Google OAuth authentication
 * - JWT token handling and refresh
 * - Error handling and edge cases
 */

import request from 'supertest';
import { jest } from '@jest/globals';
import { OAuth2Client } from 'google-auth-library';

// Mock Google OAuth2Client
jest.mock('google-auth-library');

// Mock database
const mockDb = {
  prepare: jest.fn().mockReturnValue({
    get: jest.fn(),
    run: jest.fn(),
  }),
};

// Mock JWT functions
const mockJwt = {
  generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
};

// Mock bcrypt
const mockBcrypt = {
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
};

describe('Authentication Routes', () => {
  let app;
  let mockVerifyIdToken;

  beforeAll(async () => {
    // Set up environment variables for testing
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';

    // Mock Google OAuth2Client
    mockVerifyIdToken = jest.fn();
    OAuth2Client.mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
    }));

    // Import app after mocking dependencies
    const { default: authRouter } = await import('../routes/auth.js');
    
    // Create test app
    const express = await import('express');
    app = express.default();
    app.use(express.json());
    app.use('/api/auth', authRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should successfully register a new user', async () => {
      // Mock database responses
      mockDb.prepare().get.mockReturnValue(null); // No existing user
      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe('user');
    });

    test('should fail if user already exists', async () => {
      // Mock existing user
      mockDb.prepare().get.mockReturnValue({ id: 'existing-id' });

      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('User already exists');
    });

    test('should fail with missing required fields', async () => {
      const testCases = [
        { name: 'John Doe', password: 'password123' }, // Missing email
        { email: 'john@example.com', password: 'password123' }, // Missing name
        { name: 'John Doe', email: 'john@example.com' }, // Missing password
      ];

      for (const userData of testCases) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.error).toBe('Name, email, and password are required');
      }
    });
  });

  describe('POST /api/auth/login', () => {
    test('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        role: 'user',
        working_hours_start: '09:00',
        working_hours_end: '17:00',
        working_days: JSON.stringify([1, 2, 3, 4, 5]),
      };

      // Mock database and bcrypt responses
      mockDb.prepare().get.mockReturnValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);

      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    test('should fail with invalid email', async () => {
      // Mock no user found
      mockDb.prepare().get.mockReturnValue(null);

      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should fail with invalid password', async () => {
      const mockUser = {
        id: 'user-id',
        password: 'hashed-password',
      };

      // Mock database and bcrypt responses
      mockDb.prepare().get.mockReturnValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false); // Invalid password

      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should fail with missing credentials', async () => {
      const testCases = [
        { password: 'password123' }, // Missing email
        { email: 'john@example.com' }, // Missing password
      ];

      for (const loginData of testCases) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(400);

        expect(response.body.error).toBe('Email and password are required');
      }
    });
  });

  describe('POST /api/auth/google', () => {
    test('should successfully authenticate with valid Google credential', async () => {
      const mockGooglePayload = {
        email: 'google@example.com',
        name: 'Google User',
        picture: 'https://example.com/picture.jpg',
      };

      // Mock Google token verification
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => mockGooglePayload,
      });

      // Mock database responses for new user
      mockDb.prepare().get.mockReturnValue(null); // No existing user
      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const googleData = {
        credential: 'mock-google-jwt-token',
      };

      const response = await request(app)
        .post('/api/auth/google')
        .send(googleData)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(mockGooglePayload.email);
      expect(response.body.user.name).toBe(mockGooglePayload.name);
    });

    test('should authenticate existing Google user', async () => {
      const mockGooglePayload = {
        email: 'existing-google@example.com',
        name: 'Existing Google User',
        picture: 'https://example.com/picture.jpg',
      };

      const mockExistingUser = {
        id: 'existing-user-id',
        name: 'Existing Google User',
        email: 'existing-google@example.com',
        role: 'user',
        profile_picture: 'https://example.com/old-picture.jpg',
        working_hours_start: '09:00',
        working_hours_end: '17:00',
        working_days: JSON.stringify([1, 2, 3, 4, 5]),
      };

      // Mock Google token verification
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => mockGooglePayload,
      });

      // Mock database responses for existing user
      mockDb.prepare().get.mockReturnValue(mockExistingUser);
      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const googleData = {
        credential: 'mock-google-jwt-token',
      };

      const response = await request(app)
        .post('/api/auth/google')
        .send(googleData)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(mockGooglePayload.email);
      expect(response.body.user.id).toBe(mockExistingUser.id);
    });

    test('should fail with missing Google credential', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Google credential not provided');
    });

    test('should fail with invalid Google token', async () => {
      // Mock Google token verification failure
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => null,
      });

      const googleData = {
        credential: 'invalid-google-jwt-token',
      };

      const response = await request(app)
        .post('/api/auth/google')
        .send(googleData)
        .expect(400);

      expect(response.body.error).toBe('Invalid Google token');
    });

    test('should handle Google authentication service errors', async () => {
      // Mock Google service error
      mockVerifyIdToken.mockRejectedValue(new Error('Google service error'));

      const googleData = {
        credential: 'mock-google-jwt-token',
      };

      const response = await request(app)
        .post('/api/auth/google')
        .send(googleData)
        .expect(500);

      expect(response.body.error).toBe('Failed to authenticate with Google');
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('should successfully refresh access token', async () => {
      const mockUser = {
        id: 'user-id',
        refresh_token: 'valid-refresh-token',
      };

      // Mock database response
      mockDb.prepare().get.mockReturnValue(mockUser);
      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer valid-refresh-token')
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    test('should fail with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.error).toBe('Refresh token required');
    });

    test('should fail with invalid refresh token', async () => {
      // Mock no user found with refresh token
      mockDb.prepare().get.mockReturnValue(null);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-refresh-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid refresh token');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Mock database error
      mockDb.prepare.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
    });

    test('should handle bcrypt errors gracefully', async () => {
      // Mock bcrypt error
      mockBcrypt.hash.mockRejectedValue(new Error('Bcrypt error'));

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('Security Tests', () => {
    test('should not expose sensitive user data', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
        role: 'user',
        refresh_token: 'old-refresh-token',
      };

      mockDb.prepare().get.mockReturnValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);

      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Ensure password and refresh_token are not exposed
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('refresh_token');
    });

    test('should use proper HTTP status codes', async () => {
      // Test various error conditions return appropriate status codes
      const testCases = [
        {
          endpoint: '/api/auth/register',
          data: {},
          expectedStatus: 400,
        },
        {
          endpoint: '/api/auth/login',
          data: {},
          expectedStatus: 400,
        },
        {
          endpoint: '/api/auth/google',
          data: {},
          expectedStatus: 400,
        },
      ];

      for (const testCase of testCases) {
        await request(app)
          .post(testCase.endpoint)
          .send(testCase.data)
          .expect(testCase.expectedStatus);
      }
    });
  });
});