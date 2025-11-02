import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import {initializeDatabase} from "./database.js";

// Import configuration
import { config } from './config/appConfig.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js' ;
import taskRoutes from './routes/tasks.js';
import teamRoutes from './routes/teams.js';
import userRoutes from './routes/users.js';
import scheduleRoutes from './routes/schedule.js';

import { fileURLToPath } from 'url';
import path ,{join } from 'path';
import { auth } from 'google-auth-library';

// recreate __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors(config.cors));

// Additional headers for Google OAuth compatibility
app.use((req, res, next) => {
  res.header('Cross-Origin-Opener-Policy', config.security.crossOriginOpenerPolicy);
  res.header('Cross-Origin-Embedder-Policy', config.security.crossOriginEmbedderPolicy);
  next();
});

app.use(json());

// API Routes - MUST be before catch-all routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedule', scheduleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Welcome routes (AFTER API routes so they don't intercept them)
app.get('/', (req, res) => {
  res.send('Welcome to the Task Management API');
});
app.get('/api', (req, res) => {
  res.send('Welcome to the Task Management API');
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and return the server (useful for tests)
const startServer = async () => {
  try {
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
};

// Only auto-start when not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
}

export { app, startServer };