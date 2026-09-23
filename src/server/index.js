import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS for all frontend requests
app.use('/api/*', cors());

// Helper function to insert activity logs into Cloudflare D1
async function logActivity(db, userName, action, details = '') {
  try {
    if (!db) return;
    await db.prepare('INSERT INTO activity_logs (user_name, action, details) VALUES (?, ?, ?)')
      .bind(userName || 'System', action, details)
      .run();
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Health Check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ==========================================
// 1. AUTH & USERS ENDPOINTS
// ==========================================

// POST /api/auth/login - Login user against `users` table in D1
app.post('/api/auth/login', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const identifier = (body.email || body.username || '').trim();
    const password = (body.password || '').trim();

    if (!identifier || !password) {
      return c.json({ success: false, error: 'Username/Email and password are required' }, 400);
    }

    // Check user in database
    const user = await db.prepare(
      'SELECT id, username, email, role, password FROM users WHERE (email = ? OR username = ?) AND password = ?'
    ).bind(identifier, identifier, password).first();

    if (user) {
      const userPayload = {
        id: user.id,
        username: user.username,
        name: user.username,
        email: user.email,
        role: user.role || 'Admin',
      };

      await logActivity(db, user.username, 'User Login', `Logged in via ${identifier}`);

      return c.json({ success: true, user: userPayload });
    }

    // Fallback default admin check if users table is empty or unpopulated
    if ((identifier === 'admin@utsav.com' || identifier === 'admin') && password === 'admin123') {
      await logActivity(db, 'admin', 'User Login', 'Default admin login fallback');
      return c.json({
        success: true,
        user: { id: 1, username: 'admin', name: 'Admin', email: 'admin@utsav.com', role: 'Super Admin' }
      });
    }

    return c.json({ success: false, error: 'Invalid username/email or password' }, 401);
  } catch (err) {
    console.error('Error in login:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// GET /api/users - Fetch users list
app.get('/api/users', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY id ASC').all();
    return c.json({ success: true, data: results });
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/users - Create new user
app.post('/api/users', async (c) => {
  try {
    const db = c.env.DB;
    const { username, email, password, role, loggedInUser } = await c.req.json();

    if (!username || !email || !password) {
      return c.json({ success: false, error: 'Username, email and password are required' }, 400);
    }

    await db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
      .bind(username.trim(), email.trim(), password.trim(), role || 'Admin')
      .run();

    await logActivity(db, loggedInUser || 'Admin', 'Create User', `Created user ${username} (${email})`);

    return c.json({ success: true, message: `User ${username} created successfully` }, 201);
  } catch (err) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 2. ACTIVITY LOGS ENDPOINT
// ==========================================

// GET /api/activity-logs - Fetch recent activity logs
app.get('/api/activity-logs', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100').all();
    return c.json({ success: true, data: results });
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 3. RECEIPTS / DONATIONS ENDPOINTS
// ==========================================

// GET /api/receipts - Fetch all receipts
app.get('/api/receipts', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT * FROM receipts ORDER BY date DESC, created_at DESC').all();

    const receipts = results.map(r => ({
      id: r.id,
      receiptNo: r.receipt_no,
      date: r.date,
      name: r.name,
      mobile: r.mobile,
      email: r.email || '',
      address: r.address || '',
      amount: Number(r.amount),
      paymentMethod: r.payment_method,
      status: r.status,
      expectedPaymentDate: r.expected_payment_date,
      expectedPaymentOption: r.expected_payment_option,
      receiver: r.receiver,
      notes: r.notes || '',
    }));

    return c.json({ success: true, data: receipts });
  } catch (err) {
    console.error('Error fetching receipts:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/receipts - Create new receipt
app.post('/api/receipts', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();

    let receiptNo = body.receiptNo;
    if (!receiptNo) {
      const countRes = await db.prepare('SELECT COUNT(*) as count FROM receipts').first();
      const nextNum = (countRes ? countRes.count : 0) + 1001;
      receiptNo = `VR-${String(nextNum).padStart(4, '0')}`;
    }

    const id = receiptNo;
    const date = body.date || new Date().toISOString().split('T')[0];
    const status = body.status || 'Paid';

    await db.prepare(`
      INSERT INTO receipts (
        id, receipt_no, date, name, mobile, email, address, amount, payment_method, status, expected_payment_date, expected_payment_option, receiver, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      receiptNo,
      date,
      body.name,
      body.mobile || '',
      body.email || '',
      body.address || '',
      Number(body.amount),
      body.paymentMethod || 'Cash',
      status,
      status === 'Pending' ? body.expectedPaymentDate || null : null,
      status === 'Pending' ? body.expectedPaymentOption || null : null,
      body.receiver || 'Amit',
      body.notes || ''
    ).run();

    const newReceipt = {
      id,
      receiptNo,
      date,
      name: body.name,
      mobile: body.mobile || '',
      email: body.email || '',
      address: body.address || '',
      amount: Number(body.amount),
      paymentMethod: body.paymentMethod || 'Cash',
      status,
      expectedPaymentDate: status === 'Pending' ? body.expectedPaymentDate || null : null,
      expectedPaymentOption: status === 'Pending' ? body.expectedPaymentOption || null : null,
      receiver: body.receiver || 'Amit',
      notes: body.notes || ''
    };

    await logActivity(
      db,
      body.receiver || 'Admin',
      'Add Receipt',
      `Created Receipt ${receiptNo} for ${body.name} (₹${body.amount} - ${body.paymentMethod})`
    );

    return c.json({ success: true, data: newReceipt }, 201);
  } catch (err) {
    console.error('Error adding receipt:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// PUT /api/receipts/:id/pay - Mark receipt as Paid
app.put('/api/receipts/:id/pay', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));

    await db.prepare(`
      UPDATE receipts 
      SET status = 'Paid', expected_payment_date = NULL, expected_payment_option = NULL 
      WHERE id = ? OR receipt_no = ?
    `).bind(id, id).run();

    await logActivity(db, body.userName || 'Admin', 'Mark Paid', `Receipt ${id} marked as Paid`);

    return c.json({ success: true, message: `Receipt ${id} marked as Paid` });
  } catch (err) {
    console.error('Error marking receipt paid:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// DELETE /api/receipts/:id - Delete receipt
app.delete('/api/receipts/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    await db.prepare('DELETE FROM receipts WHERE id = ? OR receipt_no = ?').bind(id, id).run();

    await logActivity(db, 'Admin', 'Delete Receipt', `Deleted Receipt ${id}`);

    return c.json({ success: true, message: `Receipt ${id} deleted` });
  } catch (err) {
    console.error('Error deleting receipt:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 4. EXPENSES ENDPOINTS
// ==========================================

// GET /api/expenses - Fetch all expenses
app.get('/api/expenses', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT * FROM expenses ORDER BY date DESC, created_at DESC').all();

    const expenses = results.map(e => ({
      id: e.id,
      date: e.date,
      category: e.category,
      description: e.description,
      amount: Number(e.amount),
      paidBy: e.paid_by,
      paymentMethod: e.payment_method,
      notes: e.notes || ''
    }));

    return c.json({ success: true, data: expenses });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/expenses - Add new expense
app.post('/api/expenses', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();

    const countRes = await db.prepare('SELECT COUNT(*) as count FROM expenses').first();
    const nextNum = (countRes ? countRes.count : 0) + 1;
    const id = `EXP-${String(nextNum).padStart(3, '0')}`;
    const date = body.date || new Date().toISOString().split('T')[0];

    await db.prepare(`
      INSERT INTO expenses (id, date, category, description, amount, paid_by, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      date,
      body.category,
      body.description,
      Number(body.amount),
      body.paidBy || 'Admin',
      body.paymentMethod || 'Cash',
      body.notes || ''
    ).run();

    const newExpense = {
      id,
      date,
      category: body.category,
      description: body.description,
      amount: Number(body.amount),
      paidBy: body.paidBy || 'Admin',
      paymentMethod: body.paymentMethod || 'Cash',
      notes: body.notes || ''
    };

    await logActivity(
      db,
      body.paidBy || 'Admin',
      'Add Expense',
      `Added Expense ${id} (${body.category}: ₹${body.amount} - ${body.description})`
    );

    return c.json({ success: true, data: newExpense }, 201);
  } catch (err) {
    console.error('Error adding expense:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// DELETE /api/expenses/:id - Delete expense
app.delete('/api/expenses/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    await db.prepare('DELETE FROM expenses WHERE id = ?').bind(id).run();

    await logActivity(db, 'Admin', 'Delete Expense', `Deleted Expense ${id}`);

    return c.json({ success: true, message: `Expense ${id} deleted` });
  } catch (err) {
    console.error('Error deleting expense:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 5. RECEIVERS ENDPOINTS (SEPARATE TABLE)
// ==========================================

// GET /api/receivers - Fetch all receivers from receivers table
app.get('/api/receivers', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT name FROM receivers ORDER BY name ASC').all();
    const receivers = results.map(r => r.name);
    return c.json({ success: true, data: receivers });
  } catch (err) {
    console.error('Error fetching receivers:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/receivers - Add new receiver name
app.post('/api/receivers', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const name = (body.name || '').trim();

    if (!name) {
      return c.json({ success: false, error: 'Receiver name is required' }, 400);
    }

    await db.prepare('INSERT OR IGNORE INTO receivers (name) VALUES (?)').bind(name).run();
    await logActivity(db, body.userName || 'Admin', 'Add Receiver', `Added receiver "${name}"`);

    const { results } = await db.prepare('SELECT name FROM receivers ORDER BY name ASC').all();
    const receivers = results.map(r => r.name);

    return c.json({ success: true, data: receivers }, 201);
  } catch (err) {
    console.error('Error adding receiver:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// DELETE /api/receivers/:name - Remove receiver
app.delete('/api/receivers/:name', async (c) => {
  try {
    const db = c.env.DB;
    const name = decodeURIComponent(c.req.param('name'));

    await db.prepare('DELETE FROM receivers WHERE name = ?').bind(name).run();
    await logActivity(db, 'Admin', 'Delete Receiver', `Removed receiver "${name}"`);

    const { results } = await db.prepare('SELECT name FROM receivers ORDER BY name ASC').all();
    const receivers = results.map(r => r.name);

    return c.json({ success: true, data: receivers });
  } catch (err) {
    console.error('Error deleting receiver:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 6. SETTINGS ENDPOINTS
// ==========================================

// GET /api/settings - Fetch settings
app.get('/api/settings', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT * FROM settings').all();

    const settingsObj = {};
    for (const row of results) {
      if (row.key === 'startingReceiptNo') {
        settingsObj[row.key] = Number(row.value);
      } else {
        settingsObj[row.key] = row.value;
      }
    }

    // Load receivers list from separate receivers table
    const recRes = await db.prepare('SELECT name FROM receivers ORDER BY name ASC').all();
    settingsObj.receivers = recRes.results ? recRes.results.map(r => r.name) : [];

    return c.json({ success: true, data: settingsObj });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// PUT /api/settings - Update settings
app.put('/api/settings', async (c) => {
  try {
    const db = c.env.DB;
    const newSettings = await c.req.json();

    for (const [key, val] of Object.entries(newSettings)) {
      if (key === 'receivers') continue; // Receivers handled via separate table
      const stringValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
      await db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind(key, stringValue).run();
    }

    await logActivity(db, 'Admin', 'Update Settings', 'Updated system settings');

    return c.json({ success: true, data: newSettings });
  } catch (err) {
    console.error('Error updating settings:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 6. SUMMARY STATS ENDPOINT
// ==========================================

app.get('/api/stats', async (c) => {
  try {
    const db = c.env.DB;

    const paidRes = await db.prepare("SELECT SUM(amount) as total FROM receipts WHERE status = 'Paid'").first();
    const pendingRes = await db.prepare("SELECT SUM(amount) as total FROM receipts WHERE status = 'Pending'").first();
    const expenseRes = await db.prepare("SELECT SUM(amount) as total FROM expenses").first();

    const totalCollection = paidRes?.total || 0;
    const pendingCollection = pendingRes?.total || 0;
    const totalExpenses = expenseRes?.total || 0;
    const availableBalance = totalCollection - totalExpenses;

    return c.json({
      success: true,
      data: {
        totalCollection,
        pendingCollection,
        totalExpenses,
        availableBalance
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Fallback for static assets in Cloudflare Workers
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

export default app;
