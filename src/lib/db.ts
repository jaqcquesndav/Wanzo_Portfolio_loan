import Database from 'better-sqlite3';
import { join } from 'path';


const db = new Database(join(process.cwd(), 'data.db'));


// Initialisation des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS operations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    start_date DATE NOT NULL,
    end_date DATE,
    interest_rate NUMERIC,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    equipment_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS maintenances (
    id TEXT PRIMARY KEY,
    equipment_id TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    completed_date TEXT,
    status TEXT NOT NULL,
    cost REAL,
    provider TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id TEXT PRIMARY KEY,
    equipment_id TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    date_reported TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    resolution_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS equipment_movements (
    id TEXT PRIMARY KEY,
    equipment_id TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    from_location TEXT,
    to_location TEXT,
    user_id TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export { db };