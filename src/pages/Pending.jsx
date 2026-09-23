import React from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { formatINR, formatDate, getDaysDifference } from '../data/utils';
import {
  Clock,
  CheckCircle,
  Phone,
  Eye,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export default function Pending() {
  const { receipts, markAsPaid, setPreviewReceipt } = useApp();

  const pendingList = receipts.filter((r) => r.status === 'Pending');

  // Categorize pending amounts
  const totalPendingAmount = pendingList.reduce((sum, r) => sum + r.amount, 0);

  const dueTodayList = pendingList.filter((r) => {
    const diff = getDaysDifference(r.expectedPaymentDate);
    return diff !== null && diff <= 0;
  });

  const dueSoonList = pendingList.filter((r) => {
    const diff = getDaysDifference(r.expectedPaymentDate);
    return diff !== null && diff > 0 && diff <= 3;
  });

  const dueLaterList = pendingList.filter((r) => {
    const diff = getDaysDifference(r.expectedPaymentDate);
    return diff !== null && diff > 3;
  });

  const dueTodayAmount = dueTodayList.reduce((sum, r) => sum + r.amount, 0);
  const dueSoonAmount = dueSoonList.reduce((sum, r) => sum + r.amount, 0);
  const dueLaterAmount = dueLaterList.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pending"
          value={formatINR(totalPendingAmount)}
          icon={Clock}
          color="rose"
          subtitle={`${pendingList.length} uncollected receipts`}
        />
        <StatCard
          title="Due Today / Overdue"
          value={formatINR(dueTodayAmount)}
          icon={AlertCircle}
          color="rose"
          subtitle={`${dueTodayList.length} urgent follow-ups`}
        />
        <StatCard
          title="Due in 2-3 Days"
          value={formatINR(dueSoonAmount)}
          icon={Calendar}
          color="amber"
          subtitle={`${dueSoonList.length} upcoming items`}
        />
        <StatCard
          title="Due Later"
          value={formatINR(dueLaterAmount)}
          icon={Clock}
          color="sky"
          subtitle={`${dueLaterList.length} scheduled later`}
        />
      </div>

      {/* Main Pending Items Container */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-xs p-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-stone-900 tracking-tight">
              Pending Collection Follow-ups
            </h2>
            <p className="text-xs text-stone-500">
              Directly call donors or mark payments as received
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full">
            {pendingList.length} Pending Records
          </span>
        </div>

        {/* Pending Records Grid / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingList.map((item) => {
            const diffDays = getDaysDifference(item.expectedPaymentDate);
            
            let urgencyBadge = (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-full uppercase">
                Due in {diffDays} days
              </span>
            );
            let borderClass = 'border-stone-200';
            let bgUrgency = 'bg-white';

            if (diffDays !== null && diffDays <= 0) {
              urgencyBadge = (
                <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black rounded-full uppercase animate-pulse">
                  {diffDays === 0 ? 'Due Today' : `Overdue by ${Math.abs(diffDays)} Days`}
                </span>
              );
              borderClass = 'border-rose-300';
              bgUrgency = 'bg-rose-50/20';
            } else if (diffDays !== null && diffDays <= 3) {
              urgencyBadge = (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold rounded-full uppercase">
                  Due Soon ({diffDays} Days)
                </span>
              );
              borderClass = 'border-amber-300';
              bgUrgency = 'bg-amber-50/20';
            }

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border ${borderClass} ${bgUrgency} shadow-xs space-y-4 hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-stone-500 block">
                      {item.receiptNo}
                    </span>
                    <h3 className="font-black text-base text-stone-900 mt-0.5">{item.name}</h3>
                    <p className="text-xs text-stone-500 font-mono">{item.mobile}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-rose-950 block">
                      {formatINR(item.amount)}
                    </span>
                    {urgencyBadge}
                  </div>
                </div>

                <div className="text-xs bg-stone-50 p-3 rounded-xl border border-stone-200/60 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Expected Date:</span>
                    <span className="font-bold text-stone-900">{formatDate(item.expectedPaymentDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Assigned Receiver:</span>
                    <span className="font-bold text-amber-800">{item.receiver}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200">
                      Note: "{item.notes}"
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center space-x-2 pt-1">
                  {/* Phone Call Button (Mobile tel: link) */}
                  <a
                    href={`tel:${item.mobile}`}
                    className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Donor</span>
                  </a>

                  <button
                    onClick={() => setPreviewReceipt(item)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                    title="View Receipt"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => markAsPaid(item.id)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Paid</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {pendingList.length === 0 && (
          <div className="p-12 text-center text-stone-500">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-stone-800">No Pending Collections!</h3>
            <p className="text-xs text-stone-500 mt-1">All festival donations have been fully collected.</p>
          </div>
        )}

      </div>

    </div>
  );
}
