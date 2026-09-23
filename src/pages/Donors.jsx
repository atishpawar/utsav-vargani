import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { formatINR, formatDate } from '../data/utils';
import { api } from '../api/client';
import { Users, Search, Phone, Mail, MapPin, Eye, X, Calendar, Receipt, DollarSign, History, CheckCircle, Clock } from 'lucide-react';

export default function Donors() {
  const { receipts, setPreviewReceipt } = useApp();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorHistory, setDonorHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch donors list from D1 database or compute from receipts
  const fetchDonorsList = async () => {
    setLoading(true);
    try {
      const data = await api.getDonors();
      if (Array.isArray(data) && data.length > 0) {
        setDonors(data);
      } else {
        // Fallback local group by mobile from receipts state
        computeLocalDonors();
      }
    } catch (err) {
      console.warn('API error fetching donors, computing locally:', err);
      computeLocalDonors();
    } finally {
      setLoading(false);
    }
  };

  const computeLocalDonors = () => {
    const map = {};
    receipts.forEach((r) => {
      const key = r.mobile || r.name;
      if (!map[key]) {
        map[key] = {
          id: r.donorId || key,
          name: r.name,
          mobile: r.mobile || 'N/A',
          email: r.email || '',
          address: r.address || '',
          totalContributed: 0,
          pendingAmount: 0,
          totalReceipts: 0,
          lastDonationDate: r.date,
        };
      }
      if (r.status === 'Paid') {
        map[key].totalContributed += r.amount;
      } else {
        map[key].pendingAmount += r.amount;
      }
      map[key].totalReceipts += 1;
      if (new Date(r.date) > new Date(map[key].lastDonationDate)) {
        map[key].lastDonationDate = r.date;
      }
    });
    setDonors(Object.values(map));
  };

  useEffect(() => {
    fetchDonorsList();
  }, [receipts]);

  // Open Donor History Profile
  const handleOpenDonor = async (donor) => {
    setSelectedDonor(donor);
    setLoadingHistory(true);
    try {
      if (donor.id && typeof donor.id === 'number') {
        const details = await api.getDonorDetails(donor.id);
        setDonorHistory(details);
      } else {
        // Fallback history filter by mobile or name
        const history = receipts.filter(
          (r) => (r.mobile && r.mobile === donor.mobile) || r.name === donor.name
        );
        setDonorHistory({
          ...donor,
          receipts: history,
        });
      }
    } catch {
      const history = receipts.filter(
        (r) => (r.mobile && r.mobile === donor.mobile) || r.name === donor.name
      );
      setDonorHistory({
        ...donor,
        receipts: history,
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  // Search Filtering
  const filteredDonors = donors.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.mobile && d.mobile.includes(q)) ||
      (d.address && d.address.toLowerCase().includes(q))
    );
  });

  // Calculate overall donor stats
  const totalDonorsCount = donors.length;
  const overallContributed = donors.reduce((sum, d) => sum + (d.totalContributed || 0), 0);
  const avgContribution = totalDonorsCount > 0 ? Math.round(overallContributed / totalDonorsCount) : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered Donors"
          value={totalDonorsCount}
          icon={Users}
          color="amber"
          subtitle="Unique festival contributors"
        />
        <StatCard
          title="Total Lifetime Contributions"
          value={formatINR(overallContributed)}
          icon={DollarSign}
          color="emerald"
          subtitle="Accumulated donor collections"
        />
        <StatCard
          title="Avg. Contribution / Donor"
          value={formatINR(avgContribution)}
          icon={Receipt}
          color="sky"
          subtitle="Average donation amount"
        />
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs p-6 space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Donor Directory & History</span>
            </h2>
            <p className="text-xs text-stone-500">
              Manage repeat donors, contact details, and view complete past donation records
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, mobile, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Donors Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              Loading donor records from database...
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <p className="text-sm font-bold text-stone-600">No donors found</p>
              <p className="text-xs">
                {searchQuery ? 'Try changing your search query.' : 'Donors will automatically be added when you create new receipts.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider bg-stone-50">
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Lifetime Donated</th>
                  <th className="py-3 px-4 text-center">Receipts</th>
                  <th className="py-3 px-4">Last Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDonors.map((donor) => (
                  <tr key={donor.id || donor.mobile} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-[11px] flex items-center justify-center border border-amber-300">
                          {donor.name ? donor.name.charAt(0).toUpperCase() : 'D'}
                        </div>
                        <div>
                          <span className="block font-bold text-stone-900">{donor.name}</span>
                          {donor.email && <span className="block text-[10px] text-stone-400">{donor.email}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-700 font-medium">
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{donor.mobile || 'N/A'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                      {donor.address || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-900 text-sm">
                      {formatINR(donor.totalContributed || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-stone-800">
                      <span className="px-2 py-0.5 bg-stone-100 rounded-full text-[11px]">
                        {donor.totalReceipts || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {donor.lastDonationDate ? formatDate(donor.lastDonationDate) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDonor(donor)}
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-[11px] rounded-lg transition-colors inline-flex items-center space-x-1"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>View History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* DONOR HISTORY MODAL */}
      {selectedDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-amber-200/80 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedDonor.name ? selectedDonor.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight">
                    {selectedDonor.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-0.5">
                    {selectedDonor.mobile && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-amber-600" />
                        <span>{selectedDonor.mobile}</span>
                      </span>
                    )}
                    {selectedDonor.email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-amber-600" />
                        <span>{selectedDonor.email}</span>
                      </span>
                    )}
                    {selectedDonor.address && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        <span>{selectedDonor.address}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setSelectedDonor(null); setDonorHistory(null); }}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-center">
              <div>
                <span className="block text-[10px] font-bold text-stone-500 uppercase">Lifetime Contributed</span>
                <span className="text-base font-black text-emerald-900">
                  {formatINR(selectedDonor.totalContributed || 0)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-stone-500 uppercase">Total Receipts</span>
                <span className="text-base font-black text-stone-900">
                  {selectedDonor.totalReceipts || 0}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-[10px] font-bold text-stone-500 uppercase">Pending Pledges</span>
                <span className="text-base font-black text-amber-800">
                  {formatINR(selectedDonor.pendingAmount || 0)}
                </span>
              </div>
            </div>

            {/* Past Donation History */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
                <History className="w-4 h-4 text-amber-600" />
                <span>Complete Donation History</span>
              </h3>

              {loadingHistory ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Fetching donation history...
                </div>
              ) : !donorHistory || !donorHistory.receipts || donorHistory.receipts.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  No previous donation receipts found for this donor.
                </div>
              ) : (
                <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Receipt No</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Payment Method</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {donorHistory.receipts.map((r) => (
                        <tr key={r.id || r.receiptNo} className="hover:bg-amber-50/30">
                          <td className="py-3 px-3 font-mono font-bold text-stone-900">{r.receiptNo || r.id}</td>
                          <td className="py-3 px-3 text-stone-600">{formatDate(r.date)}</td>
                          <td className="py-3 px-3 font-black text-stone-900">{formatINR(r.amount)}</td>
                          <td className="py-3 px-3 font-semibold text-stone-700">{r.paymentMethod}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                r.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedDonor(null);
                                setPreviewReceipt(r);
                              }}
                              className="p-1 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                              title="View Full Receipt"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => { setSelectedDonor(null); setDonorHistory(null); }}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
