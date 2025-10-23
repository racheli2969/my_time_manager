import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Open the database
const db = new Database(path.join(__dirname, 'taskmanagement.db'));

console.log('Starting database migration to fix password NOT NULL constraint...');

try {
  // Begin transaction
  db.exec('BEGIN TRANSACTION');
  
  // Create new users table with correct schema (password nullable)
  db.exec(`
    CREATE TABLE users_new (
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      refresh_token TEXT,
      subscription_tier TEXT DEFAULT 'free',
      subscription_expires_at DATETIME,
      CHECK ((password IS NOT NULL) OR (google_id IS NOT NULL))
    )
  `);
  
  // Copy all existing data from old table to new table
  db.exec(`
    INSERT INTO users_new 
    SELECT id, name, email, password, google_id, profile_picture, role, 
           working_hours_start, working_hours_end, working_days, created_at,
           refresh_token, subscription_tier, subscription_expires_at
    FROM users
  `);
  
  // Drop the old table
  db.exec('DROP TABLE users');
  
  // Rename the new table
  db.exec('ALTER TABLE users_new RENAME TO users');
  
  // Create the unique index for google_id
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL');
  
  // Commit transaction
  db.exec('COMMIT');
  
  console.log('✅ Database migration completed successfully!');
  console.log('Password field is now nullable for Google OAuth users.');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  db.exec('ROLLBACK');
  throw error;
} finally {
  db.close();
}