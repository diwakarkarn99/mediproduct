import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { DoseLog } from '../../types';
import { StorageService } from '../../services/storageService';

export const HistoryView: React.FC = () => {
  const [logs] = useState<DoseLog[]>(() => StorageService.getDoseLogs());
  const medicines = StorageService.getMedicines();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Adherence statistics
  const totalDoses = logs.length;
  const takenCount = logs.filter(l => l.status === 'taken').length;
  const notConfirmedCount = logs.filter(l => l.status === 'not_confirmed').length;
  const overallRate = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 100;

  // Last 7 days rate
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const recentLogs = logs.filter(l => new Date(l.scheduledDate) >= sevenDaysAgo);
  const recentTaken = recentLogs.filter(l => l.status === 'taken').length;
  const weeklyRate = recentLogs.length > 0 ? Math.round((recentTaken / recentLogs.length) * 100) : 100;

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = log.medicineName.toLowerCase().includes(q) ||
                    log.dosage.toLowerCase().includes(q) ||
                    (log.notes && log.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedMedicine !== 'all' && log.medicineId !== selectedMedicine) return false;
    if (selectedStatus !== 'all' && log.status !== selectedStatus) return false;
    if (selectedDate && log.scheduledDate !== selectedDate) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>Adherence Auditing</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3326]">
            Medicine History & Reports
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Complete verification records of all confirmed and pending doses for doctor review
          </p>
        </div>

        {/* Adherence Summary Badges */}
        <div className="flex items-center gap-4">
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-slate-200 text-center min-w-[120px]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              7-Day Adherence
            </span>
            <span className="text-2xl font-black text-teal-800 font-mono tabular-nums block mt-0.5">
              {weeklyRate}%
            </span>
          </div>
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-slate-200 text-center min-w-[120px]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              All-Time Rate
            </span>
            <span className="text-2xl font-black text-[#1E3326] font-mono tabular-nums block mt-0.5">
              {overallRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine or notes..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#F95518]"
          />
        </div>

        {/* Filter by Medicine */}
        <div>
          <select
            value={selectedMedicine}
            onChange={(e) => setSelectedMedicine(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#F95518]"
          >
            <option value="all">All Medicines ({medicines.length})</option>
            {medicines.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.dosage})</option>
            ))}
          </select>
        </div>

        {/* Filter by Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#F95518]"
          >
            <option value="all">All Statuses</option>
            <option value="taken">Confirmed Taken</option>
            <option value="pending">Pending</option>
            <option value="not_confirmed">Not Yet Confirmed</option>
            <option value="snoozed">Snoozed</option>
          </select>
        </div>

        {/* Filter by Date */}
        <div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#F95518]"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Scheduled Date & Time</th>
                <th className="py-4 px-6">Medicine & Dosage</th>
                <th className="py-4 px-6">Slot</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Recorded Response Time</th>
                <th className="py-4 px-6">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No dose records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isTaken = log.status === 'taken';
                  const isPending = log.status === 'pending';
                  const isNotConfirmed = log.status === 'not_confirmed';
                  const isSnoozed = log.status === 'snoozed';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono text-xs">
                          {log.scheduledDate}
                        </div>
                        <div className="text-slate-500 font-mono text-xs">
                          {log.scheduledTime}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          {log.medicineName}
                        </div>
                        <div className="text-xs text-teal-800 font-extrabold">
                          {log.dosage}
                        </div>
                      </td>

                      <td className="py-4 px-6 capitalize text-xs text-slate-600 font-semibold">
                        {log.slot}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {isTaken && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Taken</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                        {isNotConfirmed && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span>Not Yet Confirmed</span>
                          </span>
                        )}
                        {isSnoozed && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Snoozed</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {log.takenAt ? new Date(log.takenAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                        {log.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
