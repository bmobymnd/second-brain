import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'sb.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    dueDate TEXT,
    tagIds TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT NOT NULL,
    tagIds TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    fileName TEXT,
    fileType TEXT,
    fileSize INTEGER,
    fileUrl TEXT,
    tagIds TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    dateTime TEXT NOT NULL,
    repeat TEXT,
    completed INTEGER DEFAULT 0,
    tagIds TEXT,
    calendarEventId TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
  );
`);

export default db;

// Helper functions
export function getAll(table: string) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  return rows.map((row: any) => {
    if (row.tagIds) row.tagIds = JSON.parse(row.tagIds);
    if (row.completed !== undefined) row.completed = Boolean(row.completed);
    return row;
  });
}

export function getById(table: string, id: string) {
  const row: any = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  if (row) {
    if (row.tagIds) row.tagIds = JSON.parse(row.tagIds);
    if (row.completed !== undefined) row.completed = Boolean(row.completed);
  }
  return row;
}

export function insert(table: string, data: any) {
  const keys = Object.keys(data);
  const values = Object.values(data).map(v => {
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  const placeholders = keys.map(() => '?').join(', ');
  db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
}

export function update(table: string, id: string, data: any) {
  const updates = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data).map(v => {
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  });
  db.prepare(`UPDATE ${table} SET ${updates} WHERE id = ?`).run(...values, id);
}

export function remove(table: string, id: string) {
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
}
