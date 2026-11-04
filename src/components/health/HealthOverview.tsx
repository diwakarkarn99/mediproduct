import React from 'react';
import {
  Activity,
  CheckCircle2,
  Calendar,
  FileText,
  ShieldAlert,
  Heart,
  TrendingUp,
  Download,
  Eye,
  Pill
} from 'lucide-react';
import { StorageService } from '../../services/storageService';

export const HealthOverview: React.FC = () => {
  const user = StorageService.getCurrentUser();
  const medicines = StorageService.getMedicines().filter(m => m.isActive);
  const documents = StorageService.getDocuments();
  const todayLogs = StorageService.ensureTodayDoseLogs();
  const allLogs = StorageService.getDoseLogs();

  const totalToday = todayLogs.length;
  const takenToday = todayLogs.filter(l => l.status === 'taken').length;
  const todayPercent = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 100;

  // 7-day adherence
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const recentLogs = allLogs.filter(l => new Date(l.scheduledDate) >= sevenDaysAgo);
  const recentTaken = recentLogs.filter(l => l.status === 'taken').length;
  const weeklyAdherence = recentLogs.length > 0 ? Math.round((recentTaken / recentLogs.length) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
          <Activity className="w-4 h-4" />
          <span>Patient Health Routine</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3326]">
          Health & Routine Overview
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          A patient-centered summary of your prescribed medications, daily consistency, and verified prescription documents
        </p>

        {/* Safety Boundary Banner */}
        <div className="mt-4 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p>
            <strong>Prescription Adherence Only:</strong> MediTrack displays only the medications and schedules entered by you or your doctor. We do not provide clinical diagnoses, drug interactions, or unrequested biometric measurements.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Today's Adherence
          </div>
          <div className="text-4xl font-black text-[#1E3326] font-mono tabular-nums">
            {todayPercent}%
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {takenToday} of {totalToday} doses confirmed taken
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            7-Day Routine Consistency
          </div>
          <div className="text-4xl font-black text-teal-800 font-mono tabular-nums">
            {weeklyAdherence}%
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Calculated across {recentLogs.length} verified scheduled doses
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Prescriptions
          </div>
          <div className="text-4xl font-black text-slate-900 font-mono tabular-nums">
            {medicines.length}
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Maintained in your active medicine cabinet
          </p>
        </div>
      </div>

      {/* Routine Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-6">
        <h2 className="font-heading text-xl font-bold text-[#1E3326]">
          Prescribed Medicine Routine
        </h2>

        <div className="divide-y divide-slate-100">
          {medicines.map((med) => (
            <div key={med.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">
                      {med.name}
                    </h3>
                    <span className="text-xs font-extrabold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                      {med.dosage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {med.instructions}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                    Scheduled At
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {med.reminderTimes.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prescription Documents Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#1E3326]">
              Verified Prescription Documents
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Private doctor prescriptions stored securely for your personal records
            </p>
          </div>
        </div>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No prescription documents attached yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate max-w-[200px]">
                    <div className="font-bold text-xs text-slate-800 truncate">
                      {doc.filename}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {(doc.fileSize / 1024).toFixed(1)} KB · Uploaded {doc.uploadedAt.slice(0, 10)}
                    </div>
                  </div>
                </div>

                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-teal-800 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-300"
                  title="View document"
                >
                  <Eye className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
