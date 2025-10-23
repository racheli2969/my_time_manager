import 'dotenv/config';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try the existing database file
const dbPath = path.join(__dirname, 'taskmanagement.db');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

console.log('Adding missing columns to users table...');

try {
  // Check current schema
  const tableInfo = db.prepare('PRAGMA table_info(users)').all();
  console.log('Current users table columns:', tableInfo.map(col => col.name));
  
  // Add refresh_token column if missing
  const hasRefreshToken = tableInfo.some(col => col.name === 'refresh_token');
  if (!hasRefreshToken) {
    console.log('Adding refresh_token column...');
    db.prepare('ALTER TABLE users ADD COLUMN refresh_token TEXT').run();
  } else {
    console.log('refresh_token column already exists');
  }
  
  // Add subscription columns if missing
  const hasSubscriptionTier = tableInfo.some(col => col.name === 'subscription_tier');
  if (!hasSubscriptionTier) {
    console.log('Adding subscription_tier column...');
    db.prepare('ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT "free"').run();
  } else {
    console.log('subscription_tier column already exists');
  }
  
  const hasSubscriptionExpires = tableInfo.some(col => col.name === 'subscription_expires_at');
  if (!hasSubscriptionExpires) {
    console.log('Adding subscription_expires_at column...');
    db.prepare('ALTER TABLE users ADD COLUMN subscription_expires_at DATETIME').run();
  } else {
    console.log('subscription_expires_at column already exists');
  }
  
  // Check final schema
  const finalTableInfo = db.prepare('PRAGMA table_info(users)').all();
  console.log('Final users table columns:', finalTableInfo.map(col => col.name));
  
  console.log('Database migration completed successfully!');
} catch (error) {
  console.error('Database migration failed:', error);
} finally {
  db.close();
}
