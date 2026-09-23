import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Layout & Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import ReceiptPreview from './components/ReceiptPreview';
import QrModal from './components/QrModal';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewReceipt from './pages/NewReceipt';
import Donations from './pages/Donations';
import Donors from './pages/Donors';
import Pending from './pages/Pending';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function MainApp() {
  const { isLoggedIn, activePage } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isLoggedIn) {
    return <Login />;
  }

  // Active page router map
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'new-receipt':
        return <NewReceipt />;
      case 'donations':
        return <Donations />;
      case 'donors':
        return <Donors />;
      case 'pending':
        return <Pending />;
      case 'expenses':
        return <Expenses />;
      case 'income':
        return <Income />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row text-stone-900 font-sans antialiased selection:bg-amber-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>

      {/* Global Toast & Modal Overlays */}
      <Toast />
      <ConfirmModal />
      <ReceiptPreview />
      <QrModal />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
