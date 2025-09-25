import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const db = new Database(path.join(__dirname, 'taskmanagement.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      google_id TEXT UNIQUE,
      profile_picture TEXT,
      role TEXT CHECK(role IN ('user', 'team-member', 'admin')) DEFAULT 'user',
      working_hours_start TEXT DEFAULT '09:00',
      working_hours_end TEXT DEFAULT '17:00',
      working_days TEXT DEFAULT '[1,2,3,4,5]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Teams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      admin_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Team members junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      team_id TEXT,
      user_id TEXT,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (team_id, user_id),
      FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATETIME NOT NULL,
      estimated_duration INTEGER NOT NULL,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('todo', 'in-progress', 'completed')) DEFAULT 'todo',
      assigned_to TEXT,
      team_id TEXT,
      created_by TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL,
      FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Task intervals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_intervals (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      duration INTEGER NOT NULL,
      scheduled_start DATETIME,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    )
  `);

  // Schedule entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedule_entries (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      interval_id TEXT,
      user_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      title TEXT NOT NULL,
      priority TEXT NOT NULL,
      is_manual BOOLEAN DEFAULT FALSE,
      is_locked BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
      FOREIGN KEY (interval_id) REFERENCES task_intervals (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // User preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      auto_split_long_tasks BOOLEAN DEFAULT TRUE,
      max_task_duration INTEGER DEFAULT 180,
      break_duration INTEGER DEFAULT 15,
      work_buffer_minutes INTEGER DEFAULT 30,
      preferred_work_start TEXT DEFAULT '09:00',
      preferred_work_end TEXT DEFAULT '17:00',
      allow_weekend_scheduling BOOLEAN DEFAULT FALSE,
      efficiency_curve TEXT DEFAULT 'normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Personal events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      is_recurring BOOLEAN DEFAULT FALSE,
      recurrence_pattern TEXT,
      event_type TEXT DEFAULT 'personal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Schedule conflicts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedule_conflicts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      schedule_entry_id TEXT,
      conflict_type TEXT NOT NULL,
      conflict_details TEXT,
      is_resolved BOOLEAN DEFAULT FALSE,
      resolution_action TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (schedule_entry_id) REFERENCES schedule_entries (id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables created successfully');
};

/**
 * Migrate existing database to support Google authentication
 * Adds google_id and profile_picture columns to users table if they don't exist
 */
const migrateForGoogleAuth = () => {
  try {
    // Check if google_id column exists
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasGoogleId = tableInfo.some(col => col.name === 'google_id');
    const hasProfilePicture = tableInfo.some(col => col.name === 'profile_picture');

    if (!hasGoogleId) {
      console.log('Adding google_id column to users table...');
      // Add column without UNIQUE constraint first
      db.exec('ALTER TABLE users ADD COLUMN google_id TEXT');
      // Create unique index separately
      db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL');
    }

    if (!hasProfilePicture) {
      console.log('Adding profile_picture column to users table...');
      db.exec('ALTER TABLE users ADD COLUMN profile_picture TEXT');
    }

    console.log('Google authentication migration completed successfully');
  } catch (error) {
    console.error('Error during Google auth migration:', error);
  }
};

// Seed default admin user
const seedDefaultUser = async () => {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@taskmanagement.com');
  
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userId = uuidv4();
    
    db.prepare(`
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, 'Admin User', 'admin@taskmanagement.com', hashedPassword, 'admin');
    
    console.log('Default admin user created: admin@taskmanagement.com / admin123');
  }
};

// Initialize database
export const initializeDatabase = async () => {
  createTables();
  migrateForGoogleAuth();
  await seedDefaultUser();
};

export default db;