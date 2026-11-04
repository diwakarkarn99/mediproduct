import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Volume2,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { DoseLog, TimeSlot } from '../../types';
import { StorageService, formatTimeSlotLabel, getTodayDateString } from '../../services/storageService';
import { ReminderEngine } from '../../services/reminderEngine';

interface ScheduleViewProps {
  onRefresh: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onRefresh }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const allLogs = StorageService.getDoseLogs();
  const todayStr = getTodayDateString();

  // If today is selected, ensure logs are synchronized with active medicines
  const dayLogs = selectedDate === todayStr
    ? StorageService.ensureTodayDoseLogs()
    : allLogs.filter(l => l.scheduledDate === selectedDate);

  const morningLogs = dayLogs.filter(l => l.slot === 'morning');
  const afternoonLogs = dayLogs.filter(l => l.slot === 'afternoon');
  const eveningLogs = dayLogs.filter(l => l.slot === 'evening');

  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() - 1);
    const prevStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    setSelectedDate(prevStr);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + 1);
    const nextStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    setSelectedDate(nextStr);
  };

  const handleGoToday = () => {
    setSelectedDate(todayStr);
  };

  const handleTakeDose = (log: DoseLog) => {
    ReminderEngine.handleTaken(log.id);
    onRefresh();
  };

  const handleSpeakDay = () => {
    const total = dayLogs.length;
    const taken = dayLogs.filter(l => l.status === 'taken').length;
    const text = `Schedule for ${selectedDate}. You have ${total} doses. ${taken} are confirmed taken.`;
    ReminderEngine.speak(text);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Date Navigator */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Daily Routine Timeline</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3326]">
            Medicine Timetable
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Carefully partitioned into Morning, Afternoon, and Evening slots for easy adherence
          </p>
        </div>

        {/* Date Selector Navigation Bar */}
        <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded-2xl border border-slate-300">
          <button
            onClick={handlePrevDay}
            className="p-2.5 rounded-xl hover:bg-white text-slate-700 transition-colors"
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="px-3 text-center">
            <span className="font-bold text-sm text-slate-900 block font-mono">
              {selectedDate}
            </span>
            <span className="text-[11px] font-semibold text-teal-800 block">
              {isToday ? "Today's Schedule" : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2.5 rounded-xl hover:bg-white text-slate-700 transition-colors"
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {!isToday && (
            <button
              onClick={handleGoToday}
              className="ml-2 px-3 py-1.5 bg-[#1E3326] text-white text-xs font-bold rounded-xl hover:bg-[#15251C]"
            >
              Today
            </button>
          )}

          <button
            onClick={handleSpeakDay}
            title="Read schedule aloud"
            className="p-2 rounded-xl text-teal-800 hover:bg-white transition-colors"
            aria-label="Read schedule aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Section Slots */}
      <div className="space-y-6">
        {/* Slot 1: MORNING (6am - 11am) */}
        <SlotContainer
          title={formatTimeSlotLabel('morning')}
          colorBadge="bg-amber-500"
          logs={morningLogs}
          onTake={handleTakeDose}
          emptyText="No morning medications scheduled for this date."
        />

        {/* Slot 2: AFTERNOON (11am - 5pm) */}
        <SlotContainer
          title={formatTimeSlotLabel('afternoon')}
          colorBadge="bg-teal-500"
          logs={afternoonLogs}
          onTake={handleTakeDose}
          emptyText="No afternoon medications scheduled for this date."
        />

        {/* Slot 3: EVENING (5pm onwards) */}
        <SlotContainer
          title={formatTimeSlotLabel('evening')}
          colorBadge="bg-indigo-600"
          logs={eveningLogs}
          onTake={handleTakeDose}
          emptyText="No evening medications scheduled for this date."
        />
      </div>
    </div>
  );
};

interface SlotContainerProps {
  title: string;
  colorBadge: string;
  logs: DoseLog[];
  onTake: (log: DoseLog) => void;
  emptyText: string;
}

const SlotContainer: React.FC<SlotContainerProps> = ({
  title,
  colorBadge,
  logs,
  onTake,
  emptyText
}) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
        <span className={`w-3 h-3 rounded-full ${colorBadge}`} />
        <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
          {title}
        </h3>
        <span className="text-xs text-slate-400 font-bold ml-auto">
          {logs.length} {logs.length === 1 ? 'dose' : 'doses'}
        </span>
      </div>

      {logs.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-4">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const isTaken = log.status === 'taken';
            const isPending = log.status === 'pending' || log.status === 'snoozed';
            const isNotConfirmed = log.status === 'not_confirmed';

            return (
              <div
                key={log.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isTaken
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : isNotConfirmed
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-[#FAF8F5] border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-center min-w-[70px] shadow-2xs">
                    <span className="font-mono text-base font-extrabold text-slate-900 block leading-tight">
                      {log.scheduledTime}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      TIME
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-heading text-lg font-bold text-slate-900">
                        {log.medicineName}
                      </h4>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-md">
                        {log.dosage}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                      {log.instructions}
                    </p>

                    {log.takenAt && (
                      <p className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed taken at {new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    )}

                    {log.snoozedUntil && (
                      <p className="text-[11px] text-amber-700 font-bold mt-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Snoozed until {new Date(log.snoozedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Indicator & Take button */}
                <div className="shrink-0 flex items-center gap-3">
                  {isTaken ? (
                    <div className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>TAKEN</span>
                    </div>
                  ) : isPending ? (
                    <button
                      onClick={() => onTake(log)}
                      className="px-5 py-3 bg-[#1E3326] hover:bg-[#15251C] text-white text-xs font-black rounded-xl shadow-xs transition-colors flex items-center gap-2 min-h-[48px]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>MARK AS TAKEN</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-slate-500" />
                      <span>NOT YET CONFIRMED</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
