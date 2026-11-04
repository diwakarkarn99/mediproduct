import React from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  Heart,
  ShieldCheck,
  Settings as SettingsIcon,
  Calendar,
  Pill,
  Users
} from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storageService';

interface ProfileViewProps {
  currentUser: User;
  onNavigate: (route: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onNavigate
}) => {
  const medicines = StorageService.getMedicines().filter(m => m.isActive);
  const connections = StorageService.getCaregiverConnections();

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={currentUser.avatarUrl || '/src/assets/images/avatar_patient_eleanor_1793768037524.jpg'}
            alt={currentUser.fullName}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-[#FAF8F5] shadow-md"
          />

          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-lg uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentUser.role} Account</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-[#1E3326]">
              {currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Member of MediTrack since {new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>

            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{currentUser.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        {currentUser.emergencyContact && (
          <div className="mt-6 p-4 bg-orange-50/60 border border-orange-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F95518] text-white flex items-center justify-center font-bold">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#F95518] tracking-wider block">
                  Designated Emergency Contact
                </span>
                <span className="font-bold text-sm text-slate-900 block mt-0.5">
                  {currentUser.emergencyContact}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Routine Quick Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
            <Pill className="w-4 h-4 text-teal-700" />
            <span>Active Prescriptions</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {medicines.length}
          </div>
          <button
            onClick={() => onNavigate('medicines')}
            className="text-xs font-bold text-teal-800 hover:text-teal-900 mt-2 block"
          >
            Manage Medicines →
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Family Connections</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {connections.length}
          </div>
          <button
            onClick={() => onNavigate('family')}
            className="text-xs font-bold text-teal-800 hover:text-teal-900 mt-2 block"
          >
            Manage Family Circle →
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E2D8] space-y-3">
        <button
          onClick={() => onNavigate('settings')}
          className="w-full p-4 bg-[#FAF8F5] hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-5 h-5 text-slate-600" />
            <div>
              <div className="font-bold text-sm text-slate-900">
                Application Settings & Accessibility
              </div>
              <div className="text-xs text-slate-500">
                Easy Mode, High Contrast, voice reading, and snooze timing
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">→</span>
        </button>

        <button
          onClick={() => onNavigate('notifications')}
          className="w-full p-4 bg-[#FAF8F5] hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
            <div>
              <div className="font-bold text-sm text-slate-900">
                Multi-Recipient Escalation & Privacy
              </div>
              <div className="text-xs text-slate-500">
                Configure quiet hours and stepped alerts for caregivers
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">→</span>
        </button>
      </div>
    </div>
  );
};
