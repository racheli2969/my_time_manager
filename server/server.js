import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import { join } from 'path';
import {initializeDatabase} from "./database.js";

// Import routes
import authRoutes from './routes/auth.js' ;
import taskRoutes from './routes/tasks.js';
import teamRoutes from './routes/teams.js';
import userRoutes from './routes/users.js';
import scheduleRoutes from './routes/schedule.js';

import { fileURLToPath } from 'url';
import path from 'path';
import { auth } from 'google-auth-library';

// recreate __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Additional headers for Google OAuth compatibility
app.use((req, res, next) => {
  // Allow cross-origin requests for Google OAuth
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

app.use(json());

// API Routes
// app.use('/', (req, res) => {
// app.use('/api', authRoutes); // Also mount auth routes under /api for other auth operations
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schedule', scheduleRoutes);


// // Serve static files in production
// if (process.env.NODE_ENV === 'production') {
//   //app.use((join(__dirname, '../dist')));
//   app.use(express.static(join(__dirname, '../dist')));
  
//   app.get('*', (req, res) => {
//     res.sendFile(join(__dirname, '../dist/index.html'));
//   });
// }

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

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