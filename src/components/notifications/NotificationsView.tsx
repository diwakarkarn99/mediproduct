import React, { useState } from 'react';
import {
  BellRing,
  ShieldCheck,
  Clock,
  UserCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Lock,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Users,
  Info
} from 'lucide-react';
import {
  NotificationRecipient,
  NotificationEvent,
  NotificationSettings,
  RecipientCategory
} from '../../types';
import { StorageService } from '../../services/storageService';

export const NotificationsView: React.FC = () => {
  const [recipients, setRecipients] = useState<NotificationRecipient[]>(() =>
    StorageService.getNotificationRecipients()
  );
  const [events, setEvents] = useState<NotificationEvent[]>(() =>
    StorageService.getNotificationEvents()
  );
  const [settings, setSettings] = useState<NotificationSettings>(() =>
    StorageService.getNotificationSettings()
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState<RecipientCategory>('family');
  const [newWaitingTime, setNewWaitingTime] = useState(30);

  const refreshData = () => {
    setRecipients(StorageService.getNotificationRecipients());
    setEvents(StorageService.getNotificationEvents());
    setSettings(StorageService.getNotificationSettings());
  };

  const handleTogglePause = () => {
    const updated = { ...settings, isAlertsPaused: !settings.isAlertsPaused };
    StorageService.saveNotificationSettings(updated);
    setSettings(updated);
  };

  const handleUpdateQuietHours = (field: 'enabled' | 'start' | 'end', val: any) => {
    const updated = {
      ...settings,
      quietHoursEnabled: field === 'enabled' ? val : settings.quietHoursEnabled,
      quietHoursStart: field === 'start' ? val : settings.quietHoursStart,
      quietHoursEnd: field === 'end' ? val : settings.quietHoursEnd
    };
    StorageService.saveNotificationSettings(updated);
    setSettings(updated);
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const user = StorageService.getCurrentUser();
    const newRecipient: NotificationRecipient = {
      id: `rec-${Date.now()}`,
      userId: user.id,
      name: newName.trim(),
      email: newEmail.trim() || undefined,
      phone: newPhone.trim() || undefined,
      category: newCategory,
      escalationOrder: recipients.length + 1,
      waitingTimeMinutes: Number(newWaitingTime) || 30,
      isEnabled: true
    };

    StorageService.saveNotificationRecipient(newRecipient);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setShowAddModal(false);
    refreshData();
  };

  const handleRemoveRecipient = (id: string) => {
    StorageService.removeNotificationRecipient(id);
    refreshData();
  };

  const handleSimulateEscalation = (recipient: NotificationRecipient) => {
    const user = StorageService.getCurrentUser();
    // Community privacy enforcement
    const isCommunity = recipient.category === 'community';
    const message = isCommunity
      ? `Please check on ${user.fullName} when you can.`
      : `${user.fullName} has an unconfirmed dose after ${recipient.waitingTimeMinutes} minutes. Please check in with them.`;

    const newEvt: NotificationEvent = {
      id: `evt-${Date.now()}`,
      userId: user.id,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientCategory: recipient.category,
      message,
      status: 'sent',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    StorageService.addNotificationEvent(newEvt);
    refreshData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
            <BellRing className="w-4 h-4" />
            <span>Escalation Safeguard Architecture</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3326]">
            Multi-Recipient Escalation
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Stepped notifications to caregivers and family if a dose is not confirmed, with strict community privacy
          </p>
        </div>

        {/* Global Pause/Resume Control */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePause}
            className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all min-h-[48px] ${
              settings.isAlertsPaused
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            {settings.isAlertsPaused ? (
              <>
                <PlayCircle className="w-4 h-4 text-amber-700" />
                <span>Alerts Paused (Resume)</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4 text-slate-500" />
                <span>Pause All Alerts</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-3 bg-[#F95518] hover:bg-[#e0470f] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap min-h-[48px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recipient</span>
          </button>
        </div>
      </div>

      {/* Escalation Flow Diagram */}
      <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E8E2D8] space-y-4">
        <h3 className="font-heading text-lg font-bold text-[#1E3326]">
          Stepped Escalation Protocol
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <span className="font-bold text-[#F95518] block mb-1">Step 1: Patient</span>
            <p className="text-slate-600">
              Patient receives normal reminder popup and audio every 15 seconds.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <span className="font-bold text-teal-800 block mb-1">Step 2: Caregiver</span>
            <p className="text-slate-600">
              After 30 min grace period, primary caregiver (Sarah) is notified.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <span className="font-bold text-amber-700 block mb-1">Step 3: Family</span>
            <p className="text-slate-600">
              If still unconfirmed after 45 min, secondary family contact is notified.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <span className="font-bold text-indigo-700 block mb-1">Step 4: Community</span>
            <p className="text-slate-600">
              Only a generic wellness check request is sent. No medical details!
            </p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 text-emerald-950">
            <span className="font-bold text-emerald-800 block mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Step 5: Immediate Stop</span>
            </span>
            <p className="text-emerald-900">
              As soon as patient confirms Taken, all pending escalations cancel instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Community Privacy Guardrail Banner */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-950">
        <Lock className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm">
            Community & Neighbor Privacy Protection
          </span>
          <p className="mt-0.5 leading-relaxed">
            Community contacts receive strictly: <em>"Please check on Eleanor Vance when you can."</em> MediTrack never shares medicine names, dosages, or health conditions with community or society contacts.
          </p>
        </div>
      </div>

      {/* Recipient Management List */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-[#1E3326]">
            Configured Recipients
          </h2>
          <span className="text-xs text-slate-500">
            {recipients.length} recipients in chain
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {recipients.map((rec, idx) => (
            <div key={rec.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900">
                      {rec.name}
                    </h4>
                    <span className="capitalize px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                      {rec.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                    <span>{rec.email || rec.phone || 'In-app notification'}</span>
                    <span>·</span>
                    <span>Waiting grace period: {rec.waitingTimeMinutes} minutes</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSimulateEscalation(rec)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  title="Simulate sending stepped escalation"
                >
                  Simulate Escalation
                </button>
                <button
                  onClick={() => handleRemoveRecipient(rec.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  title="Remove recipient"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours Settings Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#1E3326]">
              Quiet Hours
            </h3>
            <p className="text-xs text-slate-500">
              Suppress audible and family escalation alerts during sleeping hours
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.quietHoursEnabled}
              onChange={(e) => handleUpdateQuietHours('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E3326]"></div>
          </label>
        </div>

        {settings.quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Quiet Hours Start
              </label>
              <input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => handleUpdateQuietHours('start', e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Quiet Hours End
              </label>
              <input
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => handleUpdateQuietHours('end', e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>
        )}
      </div>

      {/* Escalation Event Log */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4">
        <h3 className="font-heading text-lg font-bold text-[#1E3326]">
          Escalation Audit History
        </h3>
        {events.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-3">No escalation events recorded.</p>
        ) : (
          <div className="space-y-2.5">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 bg-[#FAF8F5] rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">
                    To: {evt.recipientName} ({evt.recipientCategory})
                  </div>
                  <div className="text-slate-600 mt-0.5">{evt.message}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md uppercase text-[10px]">
                    {evt.status}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    {evt.sentAt ? new Date(evt.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Recipient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-heading text-xl font-bold text-slate-900">
              Add Escalation Recipient
            </h3>
            <form onSubmit={handleAddRecipient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mark Vance"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as RecipientCategory)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none"
                >
                  <option value="caregiver">Caregiver</option>
                  <option value="family">Family Member</option>
                  <option value="community">Community / Society Contact (Privacy Masked)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Waiting Time (Minutes) *
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={240}
                  value={newWaitingTime}
                  onChange={(e) => setNewWaitingTime(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. mark@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. (555) 765-4321"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#F95518] text-white text-xs font-bold rounded-xl"
                >
                  Save Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
