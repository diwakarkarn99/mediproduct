import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  Eye,
  CheckCircle2,
  Users
} from 'lucide-react';
import { User, UserRole } from '../../types';
import {
  StorageService,
  DEFAULT_PATIENT,
  DEFAULT_CAREGIVER
} from '../../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your account email.');
        return;
      }
      setSuccessMessage('Password reset instructions have been sent to your email.');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim() || !email.trim() || !password) {
        setError('Please fill out all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        role,
        avatarUrl: role === 'patient'
          ? '/src/assets/images/avatar_patient_eleanor_1793768037524.jpg'
          : '/src/assets/images/avatar_caregiver_sarah_1793768037048.jpg',
        createdAt: new Date().toISOString()
      };

      StorageService.setCurrentUser(newUser);
      onLoginSuccess(newUser);
      onClose();
      return;
    }

    // Login mode
    if (!email.trim() || !password) {
      setError('Please provide email and password.');
      return;
    }

    // Simple demo validation
    if (email.toLowerCase().includes('sarah') || email.toLowerCase().includes('caregiver')) {
      StorageService.setCurrentUser(DEFAULT_CAREGIVER);
      onLoginSuccess(DEFAULT_CAREGIVER);
    } else {
      StorageService.setCurrentUser(DEFAULT_PATIENT);
      onLoginSuccess(DEFAULT_PATIENT);
    }
    onClose();
  };

  const handleQuickLogin = (user: User) => {
    StorageService.setCurrentUser(user);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E8E2D8] shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#1E3326] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">
              {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-xs text-emerald-200">
              MediTrack Secure Access Portal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice */}
        <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Local Storage Demo:</strong> Instant login with preloaded accounts below or register a custom test account.
          </span>
        </div>

        {/* Quick Demo One-Click Selectors */}
        <div className="p-5 pb-0 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Quick One-Click Test Logins:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin(DEFAULT_PATIENT)}
              className="p-3 bg-[#FAF8F5] hover:bg-emerald-50/60 border border-slate-200 rounded-2xl text-left transition-colors flex items-center gap-2.5"
            >
              <img
                src={DEFAULT_PATIENT.avatarUrl}
                alt="Eleanor Vance"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Eleanor Vance
                </div>
                <div className="text-[10px] text-teal-800 font-bold uppercase">
                  Patient (Age 72)
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin(DEFAULT_CAREGIVER)}
              className="p-3 bg-[#FAF8F5] hover:bg-emerald-50/60 border border-slate-200 rounded-2xl text-left transition-colors flex items-center gap-2.5"
            >
              <img
                src={DEFAULT_CAREGIVER.avatarUrl}
                alt="Sarah Vance"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Sarah Vance
                </div>
                <div className="text-[10px] text-emerald-800 font-bold uppercase">
                  Caregiver
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arthur Miller"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  I am a *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      role === 'patient'
                        ? 'bg-[#1E3326] text-white border-[#1E3326]'
                        : 'bg-[#FAF8F5] text-slate-700 border-slate-300'
                    }`}
                  >
                    Patient (Taking Meds)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('caregiver')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                      role === 'caregiver'
                        ? 'bg-[#1E3326] text-white border-[#1E3326]'
                        : 'bg-[#FAF8F5] text-slate-700 border-slate-300'
                    }`}
                  >
                    Family / Caregiver
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. eleanor.vance@example.com"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" defaultChecked className="rounded text-[#1E3326]" />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-teal-800 hover:text-teal-900 font-bold"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 bg-[#F95518] hover:bg-[#e0470f] text-white font-bold text-sm rounded-xl shadow-xs transition-colors mt-2"
          >
            {mode === 'login' ? 'Log In to MediTrack' : mode === 'register' ? 'Complete Registration' : 'Send Reset Link'}
          </button>

          {/* Mode Switchers */}
          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-teal-800 hover:text-teal-900"
                >
                  Create free account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-teal-800 hover:text-teal-900"
                >
                  Log in here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
