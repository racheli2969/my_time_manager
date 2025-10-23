import 'dotenv/config';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'taskmanagement.db');
const db = new Database(dbPath);

console.log('Clearing all refresh tokens...');

try {
  const result = db.prepare('UPDATE users SET refresh_token = NULL').run();
  console.log('Cleared refresh tokens for', result.changes, 'users');
  
  const users = db.prepare('SELECT id, email, refresh_token FROM users').all();
  console.log('Total users:', users.length);
  
  console.log('Token cleanup completed!');
} catch (error) {
  console.error('Token cleanup failed:', error);
} finally {
  db.close();
}
