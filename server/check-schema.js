import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Open the database
const db = new Database(path.join(__dirname, 'taskmanagement.db'));

console.log('=== Users Table Schema ===');
const tableInfo = db.prepare("PRAGMA table_info(users)").all();
console.log(JSON.stringify(tableInfo, null, 2));

console.log('\n=== Create Table SQL ===');
const createTableSQL = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get();
console.log(createTableSQL?.sql);

db.close();