import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_RECEIPTS, INITIAL_EXPENSES, INITIAL_SETTINGS } from '../data/mockData';
import { api } from '../api/client';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedAuth = localStorage.getItem('utsav_auth');
    return savedAuth ? JSON.parse(savedAuth) : false;
  });

  const [user, setUser] = useState(() => {
    return { name: 'Admin', username: 'admin', email: 'admin@utsav.com', role: 'Super Admin' };
  });

  // Current active page navigation
  const [activePage, setActivePage] = useState('dashboard');

  // Receipts / Donations State
  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem('utsav_receipts');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  // Expenses State
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('utsav_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Other Income State (Banners, Prizes, Sponsors, Stalls)
  const [otherIncome, setOtherIncome] = useState(() => {
    const saved = localStorage.getItem('utsav_other_income');
    return saved ? JSON.parse(saved) : [];
  });

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('utsav_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState([]);

  // Global Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [qrModalData, setQrModalData] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState(null);

  const refreshActivityLogs = async () => {
    try {
      const logs = await api.getActivityLogs();
      if (logs && Array.isArray(logs)) {
        setActivityLogs(logs);
      }
    } catch (err) {
      console.warn('Failed to fetch activity logs:', err);
    }
  };

  // Sync state with Hono D1 API on mount if backend is available
  useEffect(() => {
    let isMounted = true;
    async function syncFromBackend() {
      try {
        const [remoteReceipts, remoteExpenses, remoteOtherIncome, remoteSettings, remoteLogs, remoteReceivers] = await Promise.all([
          api.getReceipts().catch(() => null),
          api.getExpenses().catch(() => null),
          api.getOtherIncome().catch(() => null),
          api.getSettings().catch(() => null),
          api.getActivityLogs().catch(() => null),
          api.getReceivers().catch(() => null),
        ]);

        if (isMounted) {
          if (remoteReceipts && Array.isArray(remoteReceipts)) {
            setReceipts(remoteReceipts);
          }
          if (remoteExpenses && Array.isArray(remoteExpenses)) {
            setExpenses(remoteExpenses);
          }
          if (remoteOtherIncome && Array.isArray(remoteOtherIncome)) {
            setOtherIncome(remoteOtherIncome);
          }
          if (remoteSettings && Object.keys(remoteSettings).length > 0) {
            setSettings((prev) => ({
              ...prev,
              ...remoteSettings,
              receivers: Array.isArray(remoteReceivers) ? remoteReceivers : (remoteSettings.receivers || []),
            }));
          } else if (Array.isArray(remoteReceivers)) {
            setSettings((prev) => ({ ...prev, receivers: remoteReceivers }));
          }
          if (remoteLogs && Array.isArray(remoteLogs)) {
            setActivityLogs(remoteLogs);
          }
        }
      } catch (err) {
        console.warn('Backend sync warning (using local fallback state):', err);
      }
    }
    syncFromBackend();
    return () => { isMounted = false; };
  }, []);

  // Sync state to localStorage as fallback cache
  useEffect(() => {
    localStorage.setItem('utsav_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('utsav_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('utsav_other_income', JSON.stringify(otherIncome));
  }, [otherIncome]);

  useEffect(() => {
    localStorage.setItem('utsav_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('utsav_auth', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  // Toast trigger helper
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth actions
  const login = async (usernameOrEmail, password) => {
    try {
      const res = await api.login(usernameOrEmail, password);
      if (res.success) {
        setIsLoggedIn(true);
        setUser(res.user || { name: 'Admin', username: 'admin', email: usernameOrEmail, role: 'Super Admin' });
        addToast(`Welcome back, ${res.user?.username || 'Admin'}! Logged in successfully.`);
        refreshActivityLogs();
        return true;
      }
    } catch (err) {
      // Fallback local check
      if ((usernameOrEmail === 'admin@utsav.com' || usernameOrEmail === 'admin') && password === 'admin123') {
        setIsLoggedIn(true);
        setUser({ name: 'Admin', username: 'admin', email: 'admin@utsav.com', role: 'Super Admin' });
        addToast('Welcome back, Admin! Logged in successfully.');
        return true;
      }
      addToast(err.message || 'Invalid credentials!', 'error');
      return false;
    }
    return false;
  };

  const logout = () => {
    setConfirmModalData({
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out of Utsav Vargani?',
      confirmText: 'Logout',
      type: 'warning',
      onConfirm: () => {
        setIsLoggedIn(false);
        addToast('Logged out successfully.', 'info');
      },
    });
  };

  // Receipt / Donation Actions
  const addReceipt = async (data) => {
    const nextNum = receipts.length + 1001;
    const defaultReceiptNo = data.receiptNo || `${settings.receiptPrefix}${String(nextNum).padStart(4, '0')}`;
    
    const localReceipt = {
      id: defaultReceiptNo,
      receiptNo: defaultReceiptNo,
      date: data.date || new Date().toISOString().split('T')[0],
      name: data.name,
      mobile: data.mobile,
      email: data.email || '',
      address: data.address || '',
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod,
      status: data.status,
      expectedPaymentDate: data.status === 'Pending' ? data.expectedPaymentDate : null,
      expectedPaymentOption: data.status === 'Pending' ? data.expectedPaymentOption : null,
      receiver: data.receiver || settings.defaultReceiver,
      notes: data.notes || '',
    };

    try {
      const savedReceipt = await api.addReceipt(localReceipt);
      setReceipts((prev) => [savedReceipt, ...prev]);
      addToast(`Receipt ${savedReceipt.receiptNo} saved to D1 database!`);
      refreshActivityLogs();
      if (data.paymentMethod === 'UPI / QR') {
        setQrModalData(savedReceipt);
      }
      return savedReceipt;
    } catch (err) {
      console.warn('API error saving receipt, using fallback state:', err);
      setReceipts((prev) => [localReceipt, ...prev]);
      addToast(`Receipt ${defaultReceiptNo} saved locally!`);
      if (data.paymentMethod === 'UPI / QR') {
        setQrModalData(localReceipt);
      }
      return localReceipt;
    }
  };

  const markAsPaid = (receiptId) => {
    setConfirmModalData({
      title: 'Mark Donation as Paid',
      message: `Are you sure you want to mark Receipt ${receiptId} as PAID?`,
      confirmText: 'Mark as Paid',
      type: 'success',
      onConfirm: async () => {
        setReceipts((prev) =>
          prev.map((r) => (r.id === receiptId || r.receiptNo === receiptId ? { ...r, status: 'Paid', expectedPaymentDate: null } : r))
        );
        addToast(`Receipt ${receiptId} marked as Paid!`, 'success');
        try {
          await api.markAsPaid(receiptId);
          refreshActivityLogs();
        } catch (err) {
          console.warn('API sync error marking paid:', err);
        }
      },
    });
  };

  const deleteReceipt = (receiptId) => {
    setConfirmModalData({
      title: 'Delete Receipt Record',
      message: `Are you sure you want to permanently delete ${receiptId}?`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        setReceipts((prev) => prev.filter((r) => r.id !== receiptId && r.receiptNo !== receiptId));
        addToast(`Receipt ${receiptId} deleted.`, 'info');
        try {
          await api.deleteReceipt(receiptId);
          refreshActivityLogs();
        } catch (err) {
          console.warn('API sync error deleting receipt:', err);
        }
      },
    });
  };

  // Expense Actions
  const addExpense = async (data) => {
    const nextId = `EXP-${String(expenses.length + 1).padStart(3, '0')}`;
    const localExpense = {
      id: nextId,
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category,
      description: data.description,
      amount: Number(data.amount),
      paidBy: data.paidBy || 'Admin',
      paymentMethod: data.paymentMethod || 'Cash',
      notes: data.notes || '',
    };

    try {
      const savedExpense = await api.addExpense(localExpense);
      setExpenses((prev) => [savedExpense, ...prev]);
      addToast(`Expense entry ${savedExpense.id} added to D1 database!`);
      refreshActivityLogs();
      return savedExpense;
    } catch (err) {
      console.warn('API error adding expense, using local state:', err);
      setExpenses((prev) => [localExpense, ...prev]);
      addToast(`Expense entry ${nextId} added locally!`);
      return localExpense;
    }
  };

  const deleteExpense = (expenseId) => {
    setConfirmModalData({
      title: 'Delete Expense',
      message: `Are you sure you want to delete expense record ${expenseId}?`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
        addToast(`Expense ${expenseId} removed.`, 'info');
        try {
          await api.deleteExpense(expenseId);
          refreshActivityLogs();
        } catch (err) {
          console.warn('API sync error deleting expense:', err);
        }
      },
    });
  };

  // Other Income Actions (Banners, Prizes, Sponsors, Stalls)
  const addOtherIncome = async (data) => {
    const nextId = `INC-${String(otherIncome.length + 1).padStart(3, '0')}`;
    const localIncome = {
      id: nextId,
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || 'Advertisement',
      sourceName: data.sourceName || 'Sponsor',
      description: data.description || '',
      amount: Number(data.amount),
      receivedBy: data.receivedBy || 'Admin',
      paymentMethod: data.paymentMethod || 'Cash',
      notes: data.notes || '',
    };

    try {
      const savedIncome = await api.addOtherIncome(localIncome);
      setOtherIncome((prev) => [savedIncome, ...prev]);
      addToast(`Extra Income entry ${savedIncome.id} added to D1 database!`);
      refreshActivityLogs();
      return savedIncome;
    } catch (err) {
      console.warn('API error adding other income, using local state:', err);
      setOtherIncome((prev) => [localIncome, ...prev]);
      addToast(`Extra Income ${nextId} saved locally!`);
      return localIncome;
    }
  };

  const deleteOtherIncome = (incomeId) => {
    setConfirmModalData({
      title: 'Delete Extra Income Record',
      message: `Are you sure you want to delete income entry ${incomeId}?`,
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        setOtherIncome((prev) => prev.filter((item) => item.id !== incomeId));
        addToast(`Income entry ${incomeId} deleted.`, 'info');
        try {
          await api.deleteOtherIncome(incomeId);
          refreshActivityLogs();
        } catch (err) {
          console.warn('API sync error deleting other income:', err);
        }
      },
    });
  };

  // Add receiver dynamically to D1 receivers table
  const addReceiver = async (newReceiverName) => {
    const clean = newReceiverName.trim();
    if (!clean) return;
    if (!settings.receivers.includes(clean)) {
      const updated = [...settings.receivers, clean];
      setSettings((prev) => ({ ...prev, receivers: updated }));
      addToast(`Receiver "${clean}" added!`);
      try {
        const latestReceivers = await api.addReceiver(clean);
        if (Array.isArray(latestReceivers)) {
          setSettings((prev) => ({ ...prev, receivers: latestReceivers }));
        }
        refreshActivityLogs();
      } catch (err) {
        console.warn('API sync error adding receiver:', err);
      }
    }
  };

  // Delete receiver from D1 receivers table
  const deleteReceiver = async (receiverName) => {
    const clean = receiverName.trim();
    if (!clean) return;
    const updated = settings.receivers.filter((r) => r !== clean);
    setSettings((prev) => ({ ...prev, receivers: updated }));
    addToast(`Receiver "${clean}" removed.`, 'info');
    try {
      const latestReceivers = await api.deleteReceiver(clean);
      if (Array.isArray(latestReceivers)) {
        setSettings((prev) => ({ ...prev, receivers: latestReceivers }));
      }
      refreshActivityLogs();
    } catch (err) {
      console.warn('API sync error deleting receiver:', err);
    }
  };

  // Update Settings Wrapper
  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    addToast('Settings updated successfully!');
    try {
      await api.updateSettings(newSettings);
      refreshActivityLogs();
    } catch (err) {
      console.warn('API sync error updating settings:', err);
    }
  };

  // Stats Calculations
  const totalDonations = receipts
    .filter((r) => r.status === 'Paid')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingCollection = receipts
    .filter((r) => r.status === 'Pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalOtherIncome = otherIncome.reduce((sum, item) => sum + item.amount, 0);

  const totalCollection = totalDonations + totalOtherIncome;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const availableBalance = totalCollection - totalExpenses;

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        activePage,
        setActivePage,
        receipts,
        expenses,
        otherIncome,
        settings,
        activityLogs,
        refreshActivityLogs,
        setSettings: updateSettings,
        addReceipt,
        markAsPaid,
        deleteReceipt,
        addExpense,
        deleteExpense,
        addOtherIncome,
        deleteOtherIncome,
        addReceiver,
        deleteReceiver,
        toasts,
        addToast,
        removeToast,
        previewReceipt,
        setPreviewReceipt,
        qrModalData,
        setQrModalData,
        confirmModalData,
        setConfirmModalData,
        // Calculated Stats
        totalDonations,
        totalOtherIncome,
        totalCollection,
        pendingCollection,
        totalExpenses,
        availableBalance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
