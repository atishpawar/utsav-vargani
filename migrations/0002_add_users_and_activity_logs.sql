-- Migration 0002: Add Users Table, Activity Logs Table, and Clear Dummy Data

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'Admin',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user (Username: admin, Email: admin@utsav.com, Password: admin123)
INSERT OR IGNORE INTO users (username, email, password, role) VALUES 
  ('admin', 'admin@utsav.com', 'admin123', 'Super Admin');

-- 2. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Clear all dummy receipts and expenses
DELETE FROM receipts;
DELETE FROM expenses;

-- Log database setup
INSERT INTO activity_logs (user_name, action, details) VALUES 
  ('System', 'Database Initialization', 'Database tables created and dummy data cleared');
