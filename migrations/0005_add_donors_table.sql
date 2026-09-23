-- Migration 0005: Create donors table and add donor_id reference to receipts

CREATE TABLE IF NOT EXISTS donors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Add donor_id column to receipts table
ALTER TABLE receipts ADD COLUMN donor_id INTEGER DEFAULT NULL;
