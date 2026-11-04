import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Eye,
  Volume2,
  Bell,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  LogOut,
  Moon,
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AccessibilitySettings, NotificationSettings, User } from '../../types';
import { StorageService } from '../../services/storageService';
import { ReminderEngine } from '../../services/reminderEngine';

interface SettingsViewProps {
  currentUser: User;
  accessibility: AccessibilitySettings;
  onUpdateAccessibility: (settings: AccessibilitySettings) => void;
  onLogout: () => void;
  onRefreshAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  accessibility,
  onUpdateAccessibility,
  onLogout,
  onRefreshAll
}) => {
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() =>
    StorageService.getNotificationSettings()
  );
  const [aiConsent, setAiConsent] = useState<boolean>(() =>
    StorageService.getAiConsent()
  );
  const [notifPermission, setNotifPermission] = useState<string>('default');
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleToggleEasyMode = () => {
    const updated = { ...accessibility, easyMode: !accessibility.easyMode };
    StorageService.saveAccessibility(updated);
    onUpdateAccessibility(updated);
  };

  const handleToggleHighContrast = () => {
    const updated = { ...accessibility, highContrast: !accessibility.highContrast };
    StorageService.saveAccessibility(updated);
    onUpdateAccessibility(updated);
  };

  const handleToggleVoiceHelp = () => {
    const updated = { ...accessibility, voiceHelp: !accessibility.voiceHelp };
    StorageService.saveAccessibility(updated);
    onUpdateAccessibility(updated);
    if (updated.voiceHelp) {
      ReminderEngine.speak('Voice help is now turned on. All medicine reminders will be read aloud.');
    }
  };

  const handleToggleReducedMotion = () => {
    const updated = { ...accessibility, reducedMotion: !accessibility.reducedMotion };
    StorageService.saveAccessibility(updated);
    onUpdateAccessibility(updated);
  };

  const handleUpdateSnooze = (mins: number) => {
    const updated = { ...notifSettings, defaultSnoozeMinutes: mins };
    StorageService.saveNotificationSettings(updated);
    setNotifSettings(updated);
  };

  const handleUpdateGrace = (mins: number) => {
    const updated = { ...notifSettings, defaultGracePeriodMinutes: mins };
    StorageService.saveNotificationSettings(updated);
    setNotifSettings(updated);
  };

  const handleRequestNotification = async () => {
    const res = await ReminderEngine.requestNotificationPermission();
    setNotifPermission(res);
  };

  const handleToggleAiConsent = () => {
    const nextVal = !aiConsent;
    StorageService.setAiConsent(nextVal);
    setAiConsent(nextVal);
  };

  const handleResetDemoData = () => {
    StorageService.resetToDemo();
    setResetMessage('Demo data reset successfully to Eleanor Vance default routine.');
    setTimeout(() => setResetMessage(''), 4000);
    onRefreshAll();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
          <SettingsIcon className="w-4 h-4" />
          <span>Application Preferences</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3326]">
          Settings & Accessibility
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Personalize typography sizes, high contrast, reminder intervals, and privacy consent
        </p>
      </div>

      {resetMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* 1. ACCESSIBILITY SETTINGS (CRITICAL FOR OLDER ADULTS) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#1E3326]">
            Accessibility & Senior Usability
          </h2>
          <p className="text-xs text-slate-500">
            Engineered specifically to maximize comfort and readability for elderly patients
          </p>
        </div>

        <div className="space-y-4 divide-y divide-slate-100">
          {/* Easy Mode */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-base text-slate-900">
                Easy Mode (Large Text & Controls)
              </div>
              <p className="text-xs text-slate-500 max-w-lg mt-0.5">
                Increases typography size to 20px, expands button touch areas to $\ge 52px$, and simplifies visual elements.
              </p>
            </div>
            <button
              onClick={handleToggleEasyMode}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-colors min-w-[90px] ${
                accessibility.easyMode
                  ? 'bg-[#1E3326] text-white border-[#1E3326]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {accessibility.easyMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* High Contrast Mode */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-base text-slate-900">
                High Contrast Display
              </div>
              <p className="text-xs text-slate-500 max-w-lg mt-0.5">
                Pure solid black typography, crisp white background, and thick visible focus borders.
              </p>
            </div>
            <button
              onClick={handleToggleHighContrast}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-colors min-w-[90px] ${
                accessibility.highContrast
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {accessibility.highContrast ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Voice Help */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-base text-slate-900">
                Voice Reading (Speech Synthesis)
              </div>
              <p className="text-xs text-slate-500 max-w-lg mt-0.5">
                Speaks medicine reminders, daily schedule summaries, and confirmation messages aloud using browser speech.
              </p>
            </div>
            <button
              onClick={handleToggleVoiceHelp}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-colors min-w-[90px] ${
                accessibility.voiceHelp
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {accessibility.voiceHelp ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-base text-slate-900">
                Reduced Motion
              </div>
              <p className="text-xs text-slate-500 max-w-lg mt-0.5">
                Minimizes UI animations and transitions across the entire interface.
              </p>
            </div>
            <button
              onClick={handleToggleReducedMotion}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-colors min-w-[90px] ${
                accessibility.reducedMotion
                  ? 'bg-[#1E3326] text-white border-[#1E3326]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {accessibility.reducedMotion ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. REMINDER & TIMING SETTINGS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#1E3326]">
            Reminder Engine & Browser Notifications
          </h2>
          <p className="text-xs text-slate-500">
            Tune snooze delays and escalation grace periods
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default Snooze */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Default Snooze Duration
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              How long before the reminder pops up again when snoozed
            </p>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleUpdateSnooze(mins)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                    notifSettings.defaultSnoozeMinutes === mins
                      ? 'bg-[#1E3326] text-white border-[#1E3326]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Grace Period */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Escalation Grace Period
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Waiting time before notifying the primary caregiver of an unconfirmed dose
            </p>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleUpdateGrace(mins)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                    notifSettings.defaultGracePeriodMinutes === mins
                      ? 'bg-[#1E3326] text-white border-[#1E3326]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Native Browser Notification Permission */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm text-slate-900">
              Desktop / Browser Notifications
            </div>
            <p className="text-xs text-slate-500">
              Current permission status: <strong className="uppercase">{notifPermission}</strong>
            </p>
          </div>
          <button
            onClick={handleRequestNotification}
            className="px-4 py-2 bg-teal-800 text-white text-xs font-bold rounded-xl hover:bg-teal-900 transition-colors"
          >
            {notifPermission === 'granted' ? 'Permission Granted' : 'Request Permission'}
          </button>
        </div>
      </div>

      {/* 3. AI USAGE CONSENT */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#1E3326]">
              MediTrack AI Assistant Consent
            </h2>
            <p className="text-xs text-slate-500">
              Optional assistant to explain application features and summarize schedules
            </p>
          </div>

          <button
            onClick={handleToggleAiConsent}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-colors min-w-[90px] ${
              aiConsent
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {aiConsent ? 'Consent Granted' : 'Declined'}
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-slate-200">
          <strong>Privacy Guarantee:</strong> The MediTrack AI assistant does not have access to private health files or external tracking cookies. It operates solely under strict safety boundaries and never provides medical advice, diagnoses, or dosage changes.
        </p>
      </div>

      {/* 4. DATA PERSISTENCE & DEMO RESET */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#1E3326]">
            Data Storage & Environment
          </h2>
          <p className="text-xs text-slate-500">
            Currently running in high-fidelity Demo Mode (Local Storage) with Supabase PostgreSQL migration ready
          </p>
        </div>

        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              Reset Demo Data to Initial Eleanor Routine
            </span>
            <span className="text-[11px] text-slate-500">
              Restores 4 prescribed medicines, 7 days of verified dose history, and Sarah Vance caregiver link
            </span>
          </div>
          <button
            onClick={handleResetDemoData}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-teal-700" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* 5. ACCOUNT LOGOUT */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs flex items-center justify-between">
        <div>
          <div className="font-bold text-base text-slate-900">
            Logged in as {currentUser.fullName}
          </div>
          <div className="text-xs text-slate-500">
            {currentUser.email} · Role: {currentUser.role}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};
