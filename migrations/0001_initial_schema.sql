-- Initial D1 Migration for Utsav Vargani Management System

-- 1. Receipts Table
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  receipt_no TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Paid',
  expected_payment_date TEXT DEFAULT NULL,
  expected_payment_option TEXT DEFAULT NULL,
  receiver TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  paid_by TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Settings Table (Key-Value Store)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert Initial System Settings
INSERT OR REPLACE INTO settings (key, value) VALUES
  ('orgName', 'Shree Ganesh Utsav Mandal'),
  ('festivalName', 'Ganesh Utsav & Navratri 2026'),
  ('festivalSubtitle', 'गणपती • दहीहंडी • नवरात्र'),
  ('year', '2026'),
  ('address', 'Rambaug Colony, Paud Road, Kothrud, Pune - 411038'),
  ('contactNumber', '+91 98765 43210'),
  ('email', 'contact@utsavmandal.org'),
  ('upiId', 'utsav.vargani@upi'),
  ('receiptPrefix', 'VR-'),
  ('startingReceiptNo', '1001'),
  ('defaultReceiver', 'Amit'),
  ('receivers', '["Amit","Rahul","Sagar","Pratik","Admin"]'),
  ('qrImage', '/assets/qr-code.png'),
  ('theme', 'light');

-- Insert Initial Receipts (Seed Data)
INSERT OR IGNORE INTO receipts (id, receipt_no, date, name, mobile, email, address, amount, payment_method, status, expected_payment_date, expected_payment_option, receiver, notes) VALUES
  ('VR-0001', 'VR-0001', '2026-09-21', 'Rahul Patil', '9876543210', 'rahul.patil@gmail.com', 'Kothrud, Pune, Maharashtra', 1100, 'Cash', 'Paid', NULL, NULL, 'Amit', 'Regular festival contributor'),
  ('VR-0002', 'VR-0002', '2026-09-21', 'Amit Shah', '9823456789', 'amit.shah@outlook.com', 'Deccan Gymkhana, Pune', 2100, 'UPI / QR', 'Paid', NULL, NULL, 'Rahul', 'Paid via PhonePe QR'),
  ('VR-0003', 'VR-0003', '2026-09-20', 'Sneha Kulkarni', '9898989898', 'sneha.k@yahoo.com', 'Shivajinagar, Pune', 501, 'Cash', 'Pending', '2026-09-21', 'After 2 Days', 'Sagar', 'Promised to give cash today evening'),
  ('VR-0004', 'VR-0004', '2026-09-20', 'Sagar Shinde', '9765432109', 'sagar.shinde@gmail.com', 'Karve Nagar, Pune', 5001, 'UPI / QR', 'Paid', NULL, NULL, 'Pratik', 'Main sponsor for Aarti Prasad'),
  ('VR-0005', 'VR-0005', '2026-09-19', 'Pratik More', '9811223344', 'pratik.m@rediffmail.com', 'Hadapsar, Pune', 1501, 'Bank Transfer', 'Paid', NULL, NULL, 'Admin', 'NEFT transfer to society account'),
  ('VR-0006', 'VR-0006', '2026-09-19', 'Akshay Pawar', '9922334455', 'akshay.p@gmail.com', 'Aundh, Pune', 2500, 'Cash', 'Pending', '2026-09-23', 'After 4 Days', 'Amit', 'Will transfer via GPay on Wednesday'),
  ('VR-0007', 'VR-0007', '2026-09-18', 'Neha Deshmukh', '9844556677', 'neha.d@gmail.com', 'Baner, Pune', 11000, 'Cheque', 'Paid', NULL, NULL, 'Admin', 'Cheque #409210 SBI Bank'),
  ('VR-0008', 'VR-0008', '2026-09-18', 'Vikram Joshi', '9733445566', 'vjoshi@techcorp.com', 'Viman Nagar, Pune', 4000, 'Pending', 'Pending', '2026-09-21', 'After 4 Days', 'Rahul', 'Out of town, returning today'),
  ('VR-0009', 'VR-0009', '2026-09-17', 'Aniket Bhosale', '9866778899', 'aniket.b@gmail.com', 'Warje, Pune', 1001, 'Cash', 'Paid', NULL, NULL, 'Sagar', 'Paid at Mandap counter'),
  ('VR-0010', 'VR-0010', '2026-09-17', 'Pooja Jadhav', '9977889900', 'pooja.j@gmail.com', 'Bibwewadi, Pune', 3500, 'UPI / QR', 'Paid', NULL, NULL, 'Pratik', 'Google Pay');

-- Insert Initial Expenses (Seed Data)
INSERT OR IGNORE INTO expenses (id, date, category, description, amount, paid_by, payment_method, notes) VALUES
  ('EXP-001', '2026-09-20', 'Mandap', 'Main Stage Setup & Waterproof Pandal', 18500, 'Amit Shah', 'Bank Transfer', 'Advance paid to Royal Decorators'),
  ('EXP-002', '2026-09-19', 'Sound System', 'Dhol Tasha & Sound System Setup', 12000, 'Rahul Patil', 'UPI / QR', 'Dhani DJ & Sound System'),
  ('EXP-003', '2026-09-18', 'Lighting', 'LED Entrance Arch & Serial Lights', 4500, 'Sagar Shinde', 'Cash', 'Star Electricals'),
  ('EXP-004', '2026-09-18', 'Prasad', 'Modak & Ladoo for Daily Evening Aarti', 3200, 'Pratik More', 'Cash', 'Chitale Bandhu Mithaiwale'),
  ('EXP-005', '2026-09-17', 'Decoration', 'Fresh Flower Garlands & Backdrop Floral Decor', 2500, 'Amit Shah', 'UPI / QR', 'Phool Bazaar Wholesale Market');
