import 'dotenv/config';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
const db = new Database(dbPath);

console.log('Clearing all refresh tokens from database...');

try {
  const result = db.prepare('UPDATE users SET refresh_token = NULL').run();
  console.log(Cleared refresh tokens for  users);
  
  const users = db.prepare('SELECT id, email, refresh_token FROM users').all();
  console.log('Current users:', users.map(u => ({ id: u.id, email: u.email, hasRefreshToken: !!u.refresh_token })));
  
  console.log('Database cleanup completed!');
} catch (error) {
  console.error('Database cleanup failed:', error);
} finally {
  db.close();
}
