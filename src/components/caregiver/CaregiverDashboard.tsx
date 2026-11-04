import React from 'react';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Heart,
  FileText,
  Lock,
  ChevronRight,
  TrendingUp,
  Pill
} from 'lucide-react';
import { StorageService, DEFAULT_PATIENT, getTodayDateString } from '../../services/storageService';

interface CaregiverDashboardProps {
  onSwitchToPatientView: () => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  onSwitchToPatientView
}) => {
  const patient = DEFAULT_PATIENT;
  const todayLogs = StorageService.ensureTodayDoseLogs();
  const medicines = StorageService.getMedicines().filter(m => m.isActive);

  const totalDoses = todayLogs.length;
  const takenDoses = todayLogs.filter(l => l.status === 'taken').length;
  const pendingDoses = todayLogs.filter(l => l.status === 'pending' || l.status === 'snoozed').length;
  const notConfirmedDoses = todayLogs.filter(l => l.status === 'not_confirmed').length;

  const adherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#1E3326] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src="/src/assets/images/avatar_caregiver_sarah_1793768037048.jpg"
            alt="Sarah Vance, Caregiver"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/40"
          />
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Caregiver Access Portal</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mt-0.5">
              Welcome back, Sarah
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              Monitoring daily schedule and emergency alerts for Eleanor Vance
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchToPatientView}
          className="px-4 py-2.5 bg-white text-[#1E3326] hover:bg-emerald-50 text-xs font-bold rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Switch to Patient Dashboard
        </button>
      </div>

      {/* Security & Role Enforcement Banner */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
        <Lock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <p>
          <strong>Read-Only Caregiver Authorization:</strong> Per MediTrack PRD guidelines, you have granted read-access to Eleanor's daily adherence logs and emergency escalation alerts. To protect patient safety, caregivers cannot edit prescription dosages, delete medicines, or answer reminders on Eleanor's behalf.
        </p>
      </div>

      {/* Patient Summary Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src="/src/assets/images/avatar_patient_eleanor_1793768037524.jpg"
              alt="Eleanor Vance"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-2xs"
            />
            <div>
              <span className="text-[11px] font-bold uppercase text-teal-800 tracking-wider">
                Primary Patient
              </span>
              <h2 className="font-heading text-2xl font-bold text-slate-900">
                Eleanor Vance (Age 72)
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.phone}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.email}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${patient.phone}`}
              className="px-4 py-2.5 bg-[#FAF8F5] border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#F95518]" />
              <span>Call Eleanor</span>
            </a>
          </div>
        </div>

        {/* Eleanor's Today Adherence Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Scheduled Today
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
              {totalDoses} doses
            </span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Confirmed Taken
            </span>
            <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
              {takenDoses} doses
            </span>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Pending Remaining
            </span>
            <span className="text-2xl font-black text-amber-700 font-mono tabular-nums">
              {pendingDoses} doses
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Adherence Rate
            </span>
            <span className="text-2xl font-black text-teal-800 font-mono tabular-nums">
              {adherence}%
            </span>
          </div>
        </div>
      </div>

      {/* Eleanor's Live Doses Today */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-[#1E3326]">
            Today's Dose Logs for Eleanor
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {getTodayDateString()}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {todayLogs.map((log) => {
            const isTaken = log.status === 'taken';
            const isPending = log.status === 'pending' || log.status === 'snoozed';
            const isNotConfirmed = log.status === 'not_confirmed';

            return (
              <div key={log.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-slate-200 text-center min-w-[60px] font-mono font-bold text-xs">
                    {log.scheduledTime}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {log.medicineName}
                      </span>
                      <span className="text-xs font-bold text-teal-800">
                        {log.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Slot: <span className="capitalize">{log.slot}</span> · {log.instructions}
                    </p>
                  </div>
                </div>

                <div>
                  {isTaken && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Taken {log.takenAt ? `(${new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Pending</span>
                    </span>
                  )}
                  {isNotConfirmed && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>Not Yet Confirmed</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
