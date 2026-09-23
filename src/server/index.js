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
// 3. DONORS ENDPOINTS
// ==========================================

// GET /api/donors - Fetch all donors with aggregate totals
app.get('/api/donors', async (c) => {
  try {
    const db = c.env.DB;
    const { results: donors } = await db.prepare('SELECT * FROM donors ORDER BY name ASC').all();
    
    const donorList = await Promise.all(donors.map(async (d) => {
      const stats = await db.prepare(`
        SELECT 
          SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END) as total_contributed,
          SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END) as pending_amount,
          COUNT(*) as total_receipts,
          MAX(date) as last_donation_date
        FROM receipts WHERE donor_id = ? OR mobile = ?
      `).bind(d.id, d.mobile).first();

      return {
        id: d.id,
        name: d.name,
        mobile: d.mobile,
        email: d.email || '',
        address: d.address || '',
        totalContributed: stats?.total_contributed || 0,
        pendingAmount: stats?.pending_amount || 0,
        totalReceipts: stats?.total_receipts || 0,
        lastDonationDate: stats?.last_donation_date || (d.created_at ? d.created_at.split(' ')[0] : ''),
      };
    }));

    return c.json({ success: true, data: donorList });
  } catch (err) {
    console.error('Error fetching donors:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// GET /api/donors/search - Auto-suggestion search for donors by name or mobile
app.get('/api/donors/search', async (c) => {
  try {
    const db = c.env.DB;
    const q = (c.req.query('q') || '').trim();
    if (!q) return c.json({ success: true, data: [] });

    const searchPattern = `%${q}%`;
    const { results } = await db.prepare(
      'SELECT id, name, mobile, email, address FROM donors WHERE name LIKE ? OR mobile LIKE ? LIMIT 10'
    ).bind(searchPattern, searchPattern).all();

    return c.json({ success: true, data: results });
  } catch (err) {
    console.error('Error searching donors:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// GET /api/donors/:id - Fetch single donor with past donation history
app.get('/api/donors/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');
    const donor = await db.prepare('SELECT * FROM donors WHERE id = ?').bind(id).first();
    if (!donor) return c.json({ success: false, error: 'Donor not found' }, 404);

    const { results: receipts } = await db.prepare(
      'SELECT * FROM receipts WHERE donor_id = ? OR mobile = ? ORDER BY date DESC'
    ).bind(donor.id, donor.mobile).all();

    const formattedReceipts = receipts.map(r => ({
      id: r.id,
      receiptNo: r.receipt_no,
      date: r.date,
      name: r.name,
      mobile: r.mobile,
      amount: Number(r.amount),
      paymentMethod: r.payment_method,
      status: r.status,
      receiver: r.receiver,
      notes: r.notes || '',
    }));

    return c.json({
      success: true,
      donor: {
        id: donor.id,
        name: donor.name,
        mobile: donor.mobile,
        email: donor.email || '',
        address: donor.address || '',
        receipts: formattedReceipts,
      }
    });
  } catch (err) {
    console.error('Error fetching donor details:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 4. RECEIPTS / DONATIONS ENDPOINTS
// ==========================================

// GET /api/receipts - Fetch all receipts
app.get('/api/receipts', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT * FROM receipts ORDER BY date DESC, created_at DESC').all();

    const receipts = results.map(r => ({
      id: r.id,
      receiptNo: r.receipt_no,
      donorId: r.donor_id,
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

// POST /api/receipts - Create new receipt & auto-link/create donor
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

    // Auto-create or link Donor record
    let donorId = body.donorId || null;
    if (body.mobile && body.mobile.trim()) {
      const cleanMobile = body.mobile.trim();
      const cleanName = body.name ? body.name.trim() : 'Donor';
      const cleanEmail = body.email ? body.email.trim() : '';
      const cleanAddress = body.address ? body.address.trim() : '';

      const existingDonor = await db.prepare('SELECT id FROM donors WHERE mobile = ?').bind(cleanMobile).first();
      if (existingDonor) {
        donorId = existingDonor.id;
        await db.prepare(`
          UPDATE donors 
          SET name = ?, 
              email = CASE WHEN ? != '' THEN ? ELSE email END,
              address = CASE WHEN ? != '' THEN ? ELSE address END
          WHERE id = ?
        `).bind(cleanName, cleanEmail, cleanEmail, cleanAddress, cleanAddress, donorId).run();
      } else {
        const insertRes = await db.prepare('INSERT INTO donors (name, mobile, email, address) VALUES (?, ?, ?, ?)')
          .bind(cleanName, cleanMobile, cleanEmail, cleanAddress).run();
        donorId = insertRes.meta?.last_row_id || null;
      }
    }

    await db.prepare(`
      INSERT INTO receipts (
        id, receipt_no, donor_id, date, name, mobile, email, address, amount, payment_method, status, expected_payment_date, expected_payment_option, receiver, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      receiptNo,
      donorId,
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
      donorId,
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
      `Created Receipt ${receiptNo} for Donor ${body.name} (${body.mobile}) - ₹${body.amount}`
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
// 6. OTHER INCOME ENDPOINTS (Banners, Prizes, Sponsors, Stalls)
// ==========================================

// GET /api/other-income - Fetch all other income records
app.get('/api/other-income', async (c) => {
  try {
    const db = c.env.DB;
    const { results } = await db.prepare('SELECT * FROM other_income ORDER BY date DESC, created_at DESC').all();

    const otherIncome = results.map(item => ({
      id: item.id,
      date: item.date,
      category: item.category,
      sourceName: item.source_name,
      description: item.description,
      amount: Number(item.amount),
      receivedBy: item.received_by,
      paymentMethod: item.payment_method,
      notes: item.notes || '',
    }));

    return c.json({ success: true, data: otherIncome });
  } catch (err) {
    console.error('Error fetching other income:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// POST /api/other-income - Add new other income entry
app.post('/api/other-income', async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();

    const countRes = await db.prepare('SELECT COUNT(*) as count FROM other_income').first();
    const nextNum = (countRes ? countRes.count : 0) + 1;
    const id = `INC-${String(nextNum).padStart(3, '0')}`;
    const date = body.date || new Date().toISOString().split('T')[0];

    await db.prepare(`
      INSERT INTO other_income (id, date, category, source_name, description, amount, received_by, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      date,
      body.category || 'Advertisement',
      body.sourceName || 'Sponsor',
      body.description || '',
      Number(body.amount),
      body.receivedBy || 'Admin',
      body.paymentMethod || 'Cash',
      body.notes || ''
    ).run();

    const newIncome = {
      id,
      date,
      category: body.category || 'Advertisement',
      sourceName: body.sourceName || 'Sponsor',
      description: body.description || '',
      amount: Number(body.amount),
      receivedBy: body.receivedBy || 'Admin',
      paymentMethod: body.paymentMethod || 'Cash',
      notes: body.notes || '',
    };

    await logActivity(
      db,
      body.receivedBy || 'Admin',
      'Add Extra Income',
      `Recorded Extra Income ${id} (${body.category}: ₹${body.amount} from ${body.sourceName})`
    );

    return c.json({ success: true, data: newIncome }, 201);
  } catch (err) {
    console.error('Error adding other income:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// DELETE /api/other-income/:id - Delete other income entry
app.delete('/api/other-income/:id', async (c) => {
  try {
    const db = c.env.DB;
    const id = c.req.param('id');

    await db.prepare('DELETE FROM other_income WHERE id = ?').bind(id).run();
    await logActivity(db, 'Admin', 'Delete Extra Income', `Deleted Extra Income ${id}`);

    return c.json({ success: true, message: `Income ${id} deleted` });
  } catch (err) {
    console.error('Error deleting other income:', err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ==========================================
// 7. SUMMARY STATS ENDPOINT
// ==========================================

app.get('/api/stats', async (c) => {
  try {
    const db = c.env.DB;

    const paidRes = await db.prepare("SELECT SUM(amount) as total FROM receipts WHERE status = 'Paid'").first();
    const pendingRes = await db.prepare("SELECT SUM(amount) as total FROM receipts WHERE status = 'Pending'").first();
    const otherIncRes = await db.prepare("SELECT SUM(amount) as total FROM other_income").first();
    const expenseRes = await db.prepare("SELECT SUM(amount) as total FROM expenses").first();

    const totalDonations = paidRes?.total || 0;
    const pendingCollection = pendingRes?.total || 0;
    const totalOtherIncome = otherIncRes?.total || 0;
    const totalCollection = totalDonations + totalOtherIncome;
    const totalExpenses = expenseRes?.total || 0;
    const availableBalance = totalCollection - totalExpenses;

    return c.json({
      success: true,
      data: {
        totalDonations,
        totalOtherIncome,
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
