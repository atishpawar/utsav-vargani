import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../data/utils';
import BulkImportModal from '../components/BulkImportModal';
import {
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  Eye,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  X,
} from 'lucide-react';

export default function Donations() {
  const { receipts, setActivePage, setPreviewReceipt, markAsPaid, deleteReceipt, settings, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [receiverFilter, setReceiverFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // Extract all unique years from receipts for the filter dropdown
  const availableYears = Array.from(
    new Set(
      receipts
        .map((r) => r.date ? r.date.split('-')[0] : null)
        .filter(Boolean)
    )
  ).sort((a, b) => b - a);

  // Default past years if empty
  if (availableYears.length === 0) {
    availableYears.push('2026', '2025', '2024');
  }

  // Filter receipts logic
  const filteredReceipts = receipts.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.mobile.includes(search) ||
      item.receiptNo.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || item.paymentMethod === paymentFilter;
    const matchesReceiver = receiverFilter === 'All' || item.receiver === receiverFilter;
    const matchesYear = yearFilter === 'All' || (item.date && item.date.startsWith(yearFilter));

    return matchesSearch && matchesStatus && matchesPayment && matchesReceiver && matchesYear;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage) || 1;
  const paginatedItems = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    addToast('Exporting donation records to CSV...', 'success');
    const headers = 'ReceiptNo,Date,Name,Mobile,Amount,PaymentMethod,Status,Receiver\n';
    const rows = filteredReceipts
      .map(
        (r) => `${r.receiptNo},${r.date},"${r.name}",${r.mobile},${r.amount},${r.paymentMethod},${r.status},${r.receiver}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vargani_Donations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Page Action Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-stone-900 tracking-tight">Donation Records</h1>
          <p className="text-xs text-stone-500">
            Total {filteredReceipts.length} collections recorded {yearFilter !== 'All' ? `for year ${yearFilter}` : `for ${settings.festivalName}`}
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
              showFilters || statusFilter !== 'All' || paymentFilter !== 'All' || yearFilter !== 'All'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setShowBulkImport(true)}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-300 transition-colors flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-amber-700" />
            <span>Import Past CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold border border-stone-200 transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setActivePage('new-receipt')}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Receipt</span>
          </button>
        </div>
      </div>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
      />

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by donor name, mobile, or receipt number (e.g. VR-0001)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-900"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsible Extended Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                Festival Year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All Years</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid Only</option>
                <option value="Pending">Pending Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                Payment Method
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="UPI / QR">UPI / QR Code</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                Receiver
              </label>
              <select
                value={receiverFilter}
                onChange={(e) => setReceiverFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold"
              >
                <option value="All">All Receivers</option>
                {settings.receivers.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Table / Mobile Cards */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs overflow-hidden">
        
        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider bg-stone-50">
                <th className="py-3.5 px-4">Receipt No</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Donor Name</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Receiver</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900 font-mono">
                    {item.receiptNo}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">{formatDate(item.date)}</td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">{item.name}</td>
                  <td className="py-3.5 px-4 text-stone-600 font-mono">{item.mobile}</td>
                  <td className="py-3.5 px-4 font-black text-stone-900 text-sm">
                    {formatINR(item.amount)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">
                    <span className="px-2 py-0.5 bg-stone-100 rounded text-[11px]">
                      {item.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700 font-semibold">{item.receiver}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => setPreviewReceipt(item)}
                      title="View / Print Receipt"
                      className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors inline-block"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {item.status === 'Pending' && (
                      <button
                        onClick={() => markAsPaid(item.id)}
                        title="Mark as Paid"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors inline-block"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteReceipt(item.id)}
                      title="Delete Record"
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-stone-100">
          {paginatedItems.map((item) => (
            <div key={item.id} className="p-4 space-y-3 bg-white hover:bg-amber-50/20">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs bg-stone-100 px-2.5 py-1 rounded-lg text-stone-900">
                  {item.receiptNo}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    item.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{item.name}</h4>
                  <p className="text-xs text-stone-500">{item.mobile} • {formatDate(item.date)}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-rose-950 block">{formatINR(item.amount)}</span>
                  <span className="text-[10px] text-stone-500">{item.paymentMethod}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-stone-100">
                <span className="text-stone-500 text-[11px]">Rec'd by: <strong className="text-stone-800">{item.receiver}</strong></span>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewReceipt(item)}
                    className="px-3 py-1 bg-stone-100 text-stone-800 font-bold rounded-lg text-xs"
                  >
                    View
                  </button>
                  {item.status === 'Pending' && (
                    <button
                      onClick={() => markAsPaid(item.id)}
                      className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                    >
                      Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReceipts.length === 0 && (
          <div className="p-12 text-center text-stone-500">
            <Receipt className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-stone-800">No donation records found</h3>
            <p className="text-xs text-stone-500 mt-1">Try adjusting your search query or active filters.</p>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredReceipts.length > 0 && (
          <div className="px-6 py-4 bg-stone-50/80 border-t border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-600 font-semibold">
              Page {currentPage} of {totalPages} ({filteredReceipts.length} total)
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 bg-white border border-stone-200 rounded-xl disabled:opacity-40 hover:bg-stone-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 bg-white border border-stone-200 rounded-xl disabled:opacity-40 hover:bg-stone-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
