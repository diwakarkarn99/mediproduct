import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Volume2,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActiveReminder } from '../../types';
import { ReminderEngine } from '../../services/reminderEngine';

interface ReminderModalProps {
  reminder: ActiveReminder | null;
  onClose: () => void;
  onRefreshData: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  reminder,
  onClose,
  onRefreshData
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reminder) return null;

  const { dose, medicine } = reminder;

  const handleTaken = () => {
    setIsSubmitting(true);
    // Celebrate successful adherence
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    ReminderEngine.handleTaken(dose.id, notes.trim() || undefined);
    onRefreshData();
    setIsSubmitting(false);
    onClose();
  };

  const handleSnooze = (minutes = 10) => {
    setIsSubmitting(true);
    ReminderEngine.handleSnooze(dose.id, minutes);
    onRefreshData();
    setIsSubmitting(false);
    onClose();
  };

  const handleNotYetTaken = () => {
    setIsSubmitting(true);
    ReminderEngine.handleNotYetTaken(dose.id);
    onRefreshData();
    setIsSubmitting(false);
    onClose();
  };

  const replayVoice = () => {
    ReminderEngine.speak(
      `Reminder: It is time to take ${medicine.name}, ${medicine.dosage}. Scheduled instructions: ${medicine.instructions}`
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border-2 border-[#1E3326] rounded-3xl shadow-2xl overflow-hidden">
        {/* Urgent Header Banner */}
        <div className="bg-[#1E3326] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F95518] flex items-center justify-center text-white shadow-md animate-bounce">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reminder-title" className="font-heading text-xl font-bold tracking-tight text-white">
                Time for your medicine!
              </h2>
              <p className="text-xs text-emerald-200">
                Scheduled for {dose.scheduledTime}
              </p>
            </div>
          </div>

          <button
            onClick={replayVoice}
            title="Read instructions out loud"
            className="p-2.5 rounded-xl bg-[#2D4C39] hover:bg-[#395F47] text-white transition-colors"
            aria-label="Read instructions out loud"
          >
            <Volume2 className="w-5 h-5 text-emerald-200" />
          </button>
        </div>

        {/* Medicine Details Card */}
        <div className="p-6 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-teal-800 tracking-wider">
                  Prescribed Medicine
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                  {medicine.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-sm rounded-lg">
                  {medicine.dosage}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Instructions from Prescription:
              </p>
              <p className="text-base text-slate-800 font-medium mt-1 leading-relaxed">
                {medicine.instructions}
              </p>
            </div>

            {medicine.notes && (
              <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                Note: {medicine.notes}
              </p>
            )}
          </div>

          {/* Quick optional note */}
          <div>
            <label htmlFor="dose-notes" className="block text-xs font-semibold text-slate-600 mb-1">
              Optional note (e.g. "Taken with cup of tea and toast")
            </label>
            <input
              id="dose-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add optional note..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F95518] focus:border-[#F95518] outline-none"
            />
          </div>

          {/* Primary Action Buttons (High contrast, >= 48px touch targets) */}
          <div className="space-y-3 pt-2">
            {/* Button 1: TAKEN */}
            <button
              onClick={handleTaken}
              disabled={isSubmitting}
              className="w-full min-h-[56px] px-6 py-3.5 bg-[#1E3326] hover:bg-[#15251C] active:scale-[0.99] text-white font-black text-lg rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 border-2 border-[#1E3326]"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>YES, I HAVE TAKEN THIS</span>
            </button>

            {/* Sub-Actions: Snooze and Not Yet Taken */}
            <div className="grid grid-cols-2 gap-3">
              {/* Button 2: SNOOZE */}
              <button
                onClick={() => handleSnooze(10)}
                disabled={isSubmitting}
                className="min-h-[50px] px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border-2 border-slate-300 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Snooze (10 min)</span>
              </button>

              {/* Button 3: NOT YET TAKEN */}
              <button
                onClick={handleNotYetTaken}
                disabled={isSubmitting}
                className="min-h-[50px] px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border-2 border-slate-300 hover:border-slate-400 transition-colors flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span>Not Yet Taken</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-500">
            Confirming doses keeps your family & caregiver informed and cancels automatic alerts.
          </p>
        </div>
      </div>
    </div>
  );
};
