/**
 * API Client for Utsav Vargani Management System
 * Communicates with Hono backend on Cloudflare D1
 */

const API_BASE = '/api';

export const api = {
  // Health check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // Receipts / Donations API
  async getReceipts() {
    const res = await fetch(`${API_BASE}/receipts`);
    if (!res.ok) throw new Error('Failed to fetch receipts');
    const json = await res.json();
    return json.data;
  },

  async addReceipt(receiptData) {
    const res = await fetch(`${API_BASE}/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData),
    });
    if (!res.ok) throw new Error('Failed to create receipt');
    const json = await res.json();
    return json.data;
  },

  async markAsPaid(receiptId) {
    const res = await fetch(`${API_BASE}/receipts/${receiptId}/pay`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to mark receipt as paid');
    const json = await res.json();
    return json;
  },

  async deleteReceipt(receiptId) {
    const res = await fetch(`${API_BASE}/receipts/${receiptId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete receipt');
    const json = await res.json();
    return json;
  },

  // Expenses API
  async getExpenses() {
    const res = await fetch(`${API_BASE}/expenses`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    const json = await res.json();
    return json.data;
  },

  async addExpense(expenseData) {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    if (!res.ok) throw new Error('Failed to add expense');
    const json = await res.json();
    return json.data;
  },

  async deleteExpense(expenseId) {
    const res = await fetch(`${API_BASE}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete expense');
    const json = await res.json();
    return json;
  },

  // Settings API
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    const json = await res.json();
    return json.data;
  },

  async updateSettings(settingsData) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    const json = await res.json();
    return json.data;
  },

  // Receivers API (Separate Table)
  async getReceivers() {
    const res = await fetch(`${API_BASE}/receivers`);
    if (!res.ok) throw new Error('Failed to fetch receivers');
    const json = await res.json();
    return json.data;
  },

  async addReceiver(name) {
    const res = await fetch(`${API_BASE}/receivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to add receiver');
    const json = await res.json();
    return json.data;
  },

  async deleteReceiver(name) {
    const res = await fetch(`${API_BASE}/receivers/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete receiver');
    const json = await res.json();
    return json.data;
  },

  // Stats API
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    const json = await res.json();
    return json.data;
  },

  // Activity Logs API
  async getActivityLogs() {
    const res = await fetch(`${API_BASE}/activity-logs`);
    if (!res.ok) throw new Error('Failed to fetch activity logs');
    const json = await res.json();
    return json.data;
  },

  // Users API
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const json = await res.json();
    return json.data;
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to create user');
    }
    const json = await res.json();
    return json;
  },

  // Auth API
  async login(usernameOrEmail, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: usernameOrEmail, username: usernameOrEmail, password }),
    });
    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error || 'Invalid credentials');
    }
    const json = await res.json();
    return json;
  }
};
