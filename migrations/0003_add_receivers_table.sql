-- Migration 0003: Create separate receivers table and clear pre-populated receivers

CREATE TABLE IF NOT EXISTS receivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Remove receivers array stored inside settings key-value store
DELETE FROM settings WHERE key = 'receivers';
