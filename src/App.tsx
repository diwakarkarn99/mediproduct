import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { ReminderModal } from './components/layout/ReminderModal';
import { LandingPage } from './components/landing/LandingPage';
import { PatientDashboard } from './components/dashboard/PatientDashboard';
import { MedicinesView } from './components/medicines/MedicinesView';
import { MedicineFormModal } from './components/medicines/MedicineFormModal';
import { ScheduleView } from './components/schedule/ScheduleView';
import { HealthOverview } from './components/health/HealthOverview';
import { FamilyCareView } from './components/family/FamilyCareView';
import { HistoryView } from './components/history/HistoryView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { SettingsView } from './components/settings/SettingsView';
import { ProfileView } from './components/profile/ProfileView';
import { AuthModal } from './components/auth/AuthModal';
import { AssistantModal } from './components/assistant/AssistantModal';

import {
  User,
  ActiveReminder,
  AccessibilitySettings
} from './types';
import {
  StorageService,
  DEFAULT_PATIENT,
  DEFAULT_CAREGIVER
} from './services/storageService';
import { ReminderEngine } from './services/reminderEngine';

export default function App() {
  // Initialize storage & engine
  useEffect(() => {
    StorageService.init();
    ReminderEngine.init();

    const unsubscribe = ReminderEngine.subscribe((reminder) => {
      setActiveReminder(reminder);
    });

    return () => {
      unsubscribe();
      ReminderEngine.destroy();
    };
  }, []);

  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    StorageService.getCurrentUser()
  );
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() =>
    StorageService.getAccessibility()
  );
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [addMedicineModalOpen, setAddMedicineModalOpen] = useState(false);
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'caregiver') {
      setCurrentRoute('caregiver');
    } else {
      setCurrentRoute('dashboard');
    }
    handleRefresh();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRoute('landing');
  };

  const handleQuickDemoPatient = () => {
    StorageService.setCurrentUser(DEFAULT_PATIENT);
    setCurrentUser(DEFAULT_PATIENT);
    setCurrentRoute('dashboard');
    handleRefresh();
  };

  const handleQuickDemoCaregiver = () => {
    StorageService.setCurrentUser(DEFAULT_CAREGIVER);
    setCurrentUser(DEFAULT_CAREGIVER);
    setCurrentRoute('caregiver');
    handleRefresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800 font-body selection:bg-teal-100 selection:text-teal-900">
      {/* Top Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onRouteChange={setCurrentRoute}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenAssistant={() => setAssistantModalOpen(true)}
        accessibility={accessibility}
        onUpdateAccessibility={setAccessibility}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-12">
        {/* Route Resolution */}
        {currentRoute === 'landing' || (!currentUser && currentRoute !== 'features' && currentRoute !== 'how-it-works' && currentRoute !== 'family-preview') ? (
          <LandingPage
            onGetStarted={() => handleOpenAuth('register')}
            onExploreFeatures={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onQuickDemoPatient={handleQuickDemoPatient}
            onQuickDemoCaregiver={handleQuickDemoCaregiver}
          />
        ) : currentRoute === 'features' || currentRoute === 'how-it-works' || currentRoute === 'family-preview' ? (
          <LandingPage
            onGetStarted={() => handleOpenAuth('register')}
            onExploreFeatures={() => {}}
            onQuickDemoPatient={handleQuickDemoPatient}
            onQuickDemoCaregiver={handleQuickDemoCaregiver}
          />
        ) : currentRoute === 'dashboard' ? (
          <PatientDashboard
            key={refreshKey}
            currentUser={currentUser || DEFAULT_PATIENT}
            onNavigate={setCurrentRoute}
            onOpenAddMedicine={() => setAddMedicineModalOpen(true)}
            onTriggerTestReminder={() => ReminderEngine.triggerManualTestReminder()}
            onRefresh={handleRefresh}
          />
        ) : currentRoute === 'medicines' ? (
          <MedicinesView key={refreshKey} onRefresh={handleRefresh} />
        ) : currentRoute === 'schedule' ? (
          <ScheduleView key={refreshKey} onRefresh={handleRefresh} />
        ) : currentRoute === 'health' ? (
          <HealthOverview key={refreshKey} />
        ) : currentRoute === 'family' ? (
          <FamilyCareView key={refreshKey} />
        ) : currentRoute === 'history' ? (
          <HistoryView key={refreshKey} />
        ) : currentRoute === 'notifications' ? (
          <NotificationsView key={refreshKey} />
        ) : currentRoute === 'caregiver' || currentRoute === 'caregiver-patients' || currentRoute === 'caregiver-escalations' ? (
          <CaregiverDashboard
            key={refreshKey}
            onSwitchToPatientView={handleQuickDemoPatient}
          />
        ) : currentRoute === 'settings' ? (
          <SettingsView
            currentUser={currentUser || DEFAULT_PATIENT}
            accessibility={accessibility}
            onUpdateAccessibility={setAccessibility}
            onLogout={handleLogout}
            onRefreshAll={handleRefresh}
          />
        ) : currentRoute === 'profile' ? (
          <ProfileView
            currentUser={currentUser || DEFAULT_PATIENT}
            onNavigate={setCurrentRoute}
          />
        ) : (
          <PatientDashboard
            key={refreshKey}
            currentUser={currentUser || DEFAULT_PATIENT}
            onNavigate={setCurrentRoute}
            onOpenAddMedicine={() => setAddMedicineModalOpen(true)}
            onTriggerTestReminder={() => ReminderEngine.triggerManualTestReminder()}
            onRefresh={handleRefresh}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (5 tabs) */}
      <MobileNav
        currentRoute={currentRoute}
        onRouteChange={setCurrentRoute}
        currentUser={currentUser}
      />

      {/* Active Medicine Reminder Dialog (Checked every 15s) */}
      <ReminderModal
        reminder={activeReminder}
        onClose={() => ReminderEngine.dismissActiveReminder()}
        onRefreshData={handleRefresh}
      />

      {/* Add / Edit Medicine Modal */}
      <MedicineFormModal
        isOpen={addMedicineModalOpen}
        onClose={() => setAddMedicineModalOpen(false)}
        onSaved={handleRefresh}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* MediTrack AI Assistant Guide Modal */}
      <AssistantModal
        isOpen={assistantModalOpen}
        onClose={() => setAssistantModalOpen(false)}
      />
    </div>
  );
}
