import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Calendar,
  History,
  Users,
  Bell,
  Volume2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { User, DoseLog, Medicine, TimeSlot } from '../../types';
import { StorageService, formatTimeSlotLabel, getTodayDateString } from '../../services/storageService';
import { ReminderEngine } from '../../services/reminderEngine';

interface PatientDashboardProps {
  currentUser: User;
  onNavigate: (route: string) => void;
  onOpenAddMedicine: () => void;
  onTriggerTestReminder: () => void;
  onRefresh: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenAddMedicine,
  onTriggerTestReminder,
  onRefresh
}) => {
  const today = getTodayDateString();
  const allLogs = StorageService.getDoseLogs();
  const todayLogs = StorageService.ensureTodayDoseLogs();
  const medicines = StorageService.getMedicines().filter(m => m.isActive);

  // Statistics calculation from actual data
  const totalScheduled = todayLogs.length;
  const takenDoses = todayLogs.filter(l => l.status === 'taken').length;
  const pendingDoses = todayLogs.filter(l => l.status === 'pending' || l.status === 'snoozed').length;
  const notConfirmedDoses = todayLogs.filter(l => l.status === 'not_confirmed').length;

  const adherencePercent = totalScheduled > 0 ? Math.round((takenDoses / totalScheduled) * 100) : 100;

  // Next upcoming dose
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sortedPending = [...todayLogs]
    .filter(l => l.status === 'pending' || l.status === 'snoozed')
    .sort((a, b) => {
      const [ha, ma] = a.scheduledTime.split(':').map(Number);
      const [hb, mb] = b.scheduledTime.split(':').map(Number);
      return ha * 60 + ma - (hb * 60 + mb);
    });

  const nextDose = sortedPending[0] || null;

  // Calculate weekly adherence data for Recharts (past 7 days)
  const weeklyData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() - i);
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    const dayName = dayNames[targetDate.getDay()];

    const dayLogs = allLogs.filter(l => l.scheduledDate === dateStr);
    const dayTotal = dayLogs.length;
    const dayTaken = dayLogs.filter(l => l.status === 'taken').length;
    const rate = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 100;

    weeklyData.push({
      day: i === 0 ? 'Today' : dayName,
      date: dateStr.slice(5),
      adherence: rate,
      taken: dayTaken,
      total: dayTotal
    });
  }

  // Group today's schedule into Morning, Afternoon, Evening
  const morningLogs = todayLogs.filter(l => l.slot === 'morning');
  const afternoonLogs = todayLogs.filter(l => l.slot === 'afternoon');
  const eveningLogs = todayLogs.filter(l => l.slot === 'evening');

  const handleQuickTake = (log: DoseLog) => {
    ReminderEngine.handleTaken(log.id);
    onRefresh();
  };

  const handleSpeakSchedule = () => {
    const text = `Good day, ${currentUser.fullName}. Today you have ${totalScheduled} scheduled doses. ${takenDoses} already taken, and ${pendingDoses} remaining.`;
    ReminderEngine.speak(text);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. WELCOME SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || '/src/assets/images/avatar_patient_eleanor_1793768037524.jpg'}
            alt={currentUser.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-600/30 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3326]">
                Good Day, {currentUser.fullName.split(' ')[0]}
              </h1>
              <button
                onClick={handleSpeakSchedule}
                title="Read schedule aloud"
                className="p-1.5 rounded-lg text-teal-800 hover:bg-teal-50 transition-colors"
                aria-label="Read daily schedule summary out loud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-600 text-sm sm:text-base font-medium mt-0.5">
              Let's keep your medicine routine on track today.
            </p>
          </div>
        </div>

        {/* Header Quick CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddMedicine}
            className="px-4 py-3 bg-[#F95518] hover:bg-[#e0470f] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medicine</span>
          </button>
          <button
            onClick={onTriggerTestReminder}
            title="Preview how a medicine reminder appears"
            className="px-4 py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-sm rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap min-h-[48px]"
          >
            <Bell className="w-4 h-4 text-teal-700" />
            <span>Test Reminder</span>
          </button>
        </div>
      </div>

      {/* 2. SECTION A: TODAY'S PROGRESS (METRIC GRID) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scheduled */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Scheduled
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalScheduled}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-medium">
            <span>Prescriptions active:</span>
            <span className="font-bold text-slate-800">{medicines.length}</span>
          </div>
        </div>

        {/* Taken Doses */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Taken Doses</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono tabular-nums">
            {takenDoses}
          </div>
          <div className="text-xs text-emerald-800 mt-2 font-medium">
            {adherencePercent}% today's progress
          </div>
        </div>

        {/* Pending Doses */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pending Doses</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-amber-700 font-mono tabular-nums">
            {pendingDoses}
          </div>
          <div className="text-xs text-amber-800 mt-2 font-medium">
            Upcoming today
          </div>
        </div>

        {/* Not Yet Confirmed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Not Yet Confirmed</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-700 font-mono tabular-nums">
            {notConfirmedDoses}
          </div>
          <div className="text-xs text-slate-500 mt-2 font-medium">
            Requires attention
          </div>
        </div>
      </div>

      {/* 3. SECTION B: NEXT MEDICINE CARD */}
      <div className="bg-gradient-to-r from-[#1E3326] to-[#26402E] text-white p-6 sm:p-7 rounded-3xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F95518]">
              <Clock className="w-4 h-4" />
              <span>Next Prescribed Medicine</span>
            </div>

            {nextDose ? (
              <div>
                <div className="flex items-baseline gap-3">
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    {nextDose.medicineName}
                  </h3>
                  <span className="text-sm font-extrabold px-3 py-1 bg-white/20 rounded-lg text-emerald-200">
                    {nextDose.dosage}
                  </span>
                </div>
                <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                  {nextDose.instructions}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-emerald-200">
                  <span className="font-mono tabular-nums font-bold text-base text-white">
                    Scheduled at {nextDose.scheduledTime}
                  </span>
                  <span>·</span>
                  <span>Slot: {nextDose.slot}</span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-heading text-2xl font-bold text-white">
                  All doses confirmed for today!
                </h3>
                <p className="text-emerald-100 text-sm mt-1">
                  Wonderful job staying on top of your prescribed routine. Rest easy.
                </p>
              </div>
            )}
          </div>

          {nextDose && (
            <div className="shrink-0 flex sm:flex-col gap-3">
              <button
                onClick={() => handleQuickTake(nextDose)}
                className="flex-1 sm:flex-none px-6 py-3.5 bg-[#F95518] hover:bg-[#e0470f] text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Mark as Taken Now</span>
              </button>
              <button
                onClick={() => onNavigate('schedule')}
                className="flex-1 sm:flex-none px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors text-center"
              >
                View Full Day Schedule
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. SECTION C: TODAY'S SCHEDULE (TIMELINE SLOTS) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E3326]">
              Today's Schedule
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Morning, afternoon, and evening medicine schedule
            </p>
          </div>
          <button
            onClick={() => onNavigate('schedule')}
            className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1"
          >
            <span>Full Schedule Page</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Morning Slot */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>{formatTimeSlotLabel('morning')}</span>
            </div>

            {morningLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No morning medicines scheduled.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {morningLogs.map((log) => (
                  <DoseCard key={log.id} log={log} onTake={handleQuickTake} />
                ))}
              </div>
            )}
          </div>

          {/* Afternoon Slot */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>{formatTimeSlotLabel('afternoon')}</span>
            </div>

            {afternoonLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No afternoon medicines scheduled.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {afternoonLogs.map((log) => (
                  <DoseCard key={log.id} log={log} onTake={handleQuickTake} />
                ))}
              </div>
            )}
          </div>

          {/* Evening Slot */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span>{formatTimeSlotLabel('evening')}</span>
            </div>

            {eveningLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No evening medicines scheduled.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eveningLogs.map((log) => (
                  <DoseCard key={log.id} log={log} onTake={handleQuickTake} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. SECTION D: WEEKLY ADHERENCE CHART (RECHARTS) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-700" />
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1E3326]">
                Weekly Adherence
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Real 7-day adherence record calculated from logged doses
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-block w-3 h-3 rounded-sm bg-[#1E3326]" />
            <span>Adherence %</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE4D8" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs">
                        <div className="font-bold text-slate-800">{data.day} ({data.date})</div>
                        <div className="text-teal-700 font-extrabold text-sm mt-1">{data.adherence}% Adherence</div>
                        <div className="text-slate-500 mt-0.5">{data.taken} of {data.total} doses confirmed</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="adherence" fill="#1E3326" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. SECTION E: QUICK ACTIONS */}
      <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E8E2D8]">
        <h3 className="font-heading text-lg font-bold text-[#1E3326] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={onOpenAddMedicine}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 transition-colors text-left shadow-2xs group min-h-[52px]"
          >
            <Plus className="w-6 h-6 text-[#F95518] mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-slate-800">Add Medicine</div>
            <div className="text-[11px] text-slate-500">Register prescription</div>
          </button>

          <button
            onClick={() => onNavigate('schedule')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 transition-colors text-left shadow-2xs group min-h-[52px]"
          >
            <Calendar className="w-6 h-6 text-teal-700 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-slate-800">View Schedule</div>
            <div className="text-[11px] text-slate-500">Timeline by day</div>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 transition-colors text-left shadow-2xs group min-h-[52px]"
          >
            <History className="w-6 h-6 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-slate-800">Dose History</div>
            <div className="text-[11px] text-slate-500">Filters & reports</div>
          </button>

          <button
            onClick={() => onNavigate('family')}
            className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-400 transition-colors text-left shadow-2xs group min-h-[52px]"
          >
            <Users className="w-6 h-6 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm text-slate-800">Manage Family</div>
            <div className="text-[11px] text-slate-500">Caregiver sharing</div>
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual dose card
const DoseCard: React.FC<{ log: DoseLog; onTake: (log: DoseLog) => void }> = ({ log, onTake }) => {
  const isTaken = log.status === 'taken';
  const isPending = log.status === 'pending' || log.status === 'snoozed';
  const isNotConfirmed = log.status === 'not_confirmed';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isTaken
          ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
          : isNotConfirmed
          ? 'bg-slate-50 border-slate-300'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-900">
              {log.scheduledTime}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-bold text-teal-800">
              {log.dosage}
            </span>
          </div>
          <h4 className="font-bold text-base text-slate-900 mt-0.5">
            {log.medicineName}
          </h4>
          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
            {log.instructions}
          </p>
        </div>

        <div className="shrink-0">
          {isTaken ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Taken</span>
            </div>
          ) : isPending ? (
            <button
              onClick={() => onTake(log)}
              className="px-3.5 py-2 bg-[#1E3326] hover:bg-[#15251C] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Take Dose</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Not Confirmed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
