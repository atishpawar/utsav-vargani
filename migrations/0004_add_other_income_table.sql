-- Migration 0004: Create table for additional / other income (Advertisements, Sponsorships, Prizes, Stall Rent)

CREATE TABLE IF NOT EXISTS other_income (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  source_name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  received_by TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
