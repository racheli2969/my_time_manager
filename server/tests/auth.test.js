import request from 'supertest';
import { test, beforeAll, afterAll, expect } from 'node:test';
import { app, startServer } from '../server.js';

let server;
beforeAll(async () => {
  server = await startServer();
});

afterAll(() => {
  if (server && server.close) server.close();
});

test('Register -> Login -> Refresh flow', async (t) => {
  const email = `testuser+${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'Test User';

  // Register
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password });

  expect(registerRes.status).toBe(201);
  expect(registerRes.body).toHaveProperty('accessToken');
  expect(registerRes.body).toHaveProperty('refreshToken');

  // Login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  expect(loginRes.status).toBe(200);
  expect(loginRes.body).toHaveProperty('accessToken');
  expect(loginRes.body).toHaveProperty('refreshToken');

  const { refreshToken } = loginRes.body;

  // Refresh
  const refreshRes = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken });

  expect(refreshRes.status).toBe(200);
  expect(refreshRes.body).toHaveProperty('accessToken');
  expect(refreshRes.body).toHaveProperty('refreshToken');
});
