import React, { useState } from 'react';
import {
  Pill,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  User as UserIcon,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  BellRing
} from 'lucide-react';
import { User, AccessibilitySettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { ReminderEngine } from '../../services/reminderEngine';

interface NavbarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
  currentUser: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenAssistant: () => void;
  accessibility: AccessibilitySettings;
  onUpdateAccessibility: (settings: AccessibilitySettings) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onRouteChange,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAssistant,
  accessibility,
  onUpdateAccessibility
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleEasyMode = () => {
    const updated = { ...accessibility, easyMode: !accessibility.easyMode };
    StorageService.saveAccessibility(updated);
    onUpdateAccessibility(updated);
  };

  const toggleVoice = () => {
    const updated = { ...accessibility, voiceHelp: !accessibility.voiceHelp };
    StorageService.saveAccessibility(updated);
    onUpdateAccessibility(updated);
    if (updated.voiceHelp) {
      ReminderEngine.speak('Voice help is now turned on.');
    }
  };

  const isPatient = currentUser?.role === 'patient';
  const isCaregiver = currentUser?.role === 'caregiver';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onRouteChange(currentUser ? (isCaregiver ? 'caregiver' : 'dashboard') : 'landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F95518]"
            aria-label="MediTrack Home"
          >
            <div className="w-11 h-11 rounded-xl bg-[#1E3326] flex items-center justify-center text-[#F95518] shadow-sm group-hover:bg-[#2A4735] transition-colors">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <span className="font-heading text-2xl font-bold tracking-tight text-[#1E3326] block leading-none">
                MediTrack
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase block mt-0.5">
                Never Miss. Never Alone.
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[15px] font-medium text-slate-700">
          {!currentUser ? (
            <>
              <button
                onClick={() => onRouteChange('landing')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'landing' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onRouteChange('features')}
                className="hover:text-[#1E3326] transition-colors whitespace-nowrap shrink-0"
              >
                Features
              </button>
              <button
                onClick={() => onRouteChange('how-it-works')}
                className="hover:text-[#1E3326] transition-colors whitespace-nowrap shrink-0"
              >
                How It Works
              </button>
              <button
                onClick={() => onRouteChange('family-preview')}
                className="hover:text-[#1E3326] transition-colors whitespace-nowrap shrink-0"
              >
                Family Care
              </button>
            </>
          ) : isPatient ? (
            <>
              <button
                onClick={() => onRouteChange('dashboard')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'dashboard' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onRouteChange('medicines')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'medicines' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Medicines
              </button>
              <button
                onClick={() => onRouteChange('schedule')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'schedule' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => onRouteChange('health')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'health' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Health
              </button>
              <button
                onClick={() => onRouteChange('family')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'family' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Family Care
              </button>
              <button
                onClick={() => onRouteChange('history')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'history' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                History
              </button>
              <button
                onClick={() => onRouteChange('notifications')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'notifications' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Alerts & Escalation
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onRouteChange('caregiver')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'caregiver' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Caregiver Portal
              </button>
              <button
                onClick={() => onRouteChange('caregiver-patients')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'caregiver-patients' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Linked Patients
              </button>
              <button
                onClick={() => onRouteChange('caregiver-escalations')}
                className={`transition-colors hover:text-[#1E3326] whitespace-nowrap shrink-0 ${
                  currentRoute === 'caregiver-escalations' ? 'text-[#1E3326] font-bold border-b-2 border-[#F95518] pb-1' : ''
                }`}
              >
                Live Escalations
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Accessibility Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Easy Mode Toggle for Elders */}
          <button
            onClick={toggleEasyMode}
            title="Toggle Large Text & Simplified Easy Mode for seniors"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              accessibility.easyMode
                ? 'bg-[#1E3326] text-white border-[#1E3326] shadow-sm'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
          >
            <span>Easy Mode</span>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                accessibility.easyMode ? 'bg-[#F95518]' : 'bg-slate-300'
              }`}
            />
          </button>

          {/* Voice Help Toggle */}
          <button
            onClick={toggleVoice}
            title={accessibility.voiceHelp ? 'Voice reading is on' : 'Turn on voice reading'}
            aria-label="Toggle Voice Reading"
            className={`p-2.5 rounded-xl border text-slate-700 transition-colors ${
              accessibility.voiceHelp
                ? 'bg-teal-50 text-teal-800 border-teal-300 ring-2 ring-teal-200'
                : 'bg-white border-slate-300 hover:bg-slate-50'
            }`}
          >
            {accessibility.voiceHelp ? <Volume2 className="w-4 h-4 text-teal-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* AI Guide Button */}
          <button
            onClick={onOpenAssistant}
            title="MediTrack AI Assistant Guide"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:border-teal-400 hover:text-teal-800 transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#F95518]" />
            <span>AI Assistant</span>
          </button>

          {/* User Profile or Login */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRouteChange('profile')}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                title="View Profile and Settings"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    {currentUser.role}
                  </span>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Log Out"
                aria-label="Log Out"
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#F95518] hover:bg-[#e0470f] rounded-xl shadow-xs transition-colors whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl border border-slate-300 text-slate-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-[#E8E2D8] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {!currentUser ? (
              <>
                <button
                  onClick={() => { onRouteChange('landing'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Home
                </button>
                <button
                  onClick={() => { onRouteChange('features'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Features
                </button>
                <button
                  onClick={() => { onRouteChange('how-it-works'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  How It Works
                </button>
                <button
                  onClick={() => { onRouteChange('family-preview'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Family Care
                </button>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                    className="flex-1 py-3 bg-white border border-slate-300 font-bold text-slate-800 rounded-xl"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                    className="flex-1 py-3 bg-[#F95518] text-white font-bold rounded-xl"
                  >
                    Get Started
                  </button>
                </div>
              </>
            ) : isPatient ? (
              <>
                <button
                  onClick={() => { onRouteChange('dashboard'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { onRouteChange('medicines'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Medicines
                </button>
                <button
                  onClick={() => { onRouteChange('schedule'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Schedule
                </button>
                <button
                  onClick={() => { onRouteChange('health'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Health Overview
                </button>
                <button
                  onClick={() => { onRouteChange('family'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Family Care
                </button>
                <button
                  onClick={() => { onRouteChange('history'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  History & Adherence
                </button>
                <button
                  onClick={() => { onRouteChange('notifications'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Alerts & Escalation
                </button>
                <button
                  onClick={() => { onRouteChange('settings'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Settings & Accessibility
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onRouteChange('caregiver'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Caregiver Dashboard
                </button>
                <button
                  onClick={() => { onRouteChange('caregiver-patients'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Linked Patients
                </button>
                <button
                  onClick={() => { onRouteChange('caregiver-escalations'); setMobileMenuOpen(false); }}
                  className="text-left px-3 py-2 text-base font-semibold text-slate-800 rounded-lg hover:bg-white"
                >
                  Escalation Alerts
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
