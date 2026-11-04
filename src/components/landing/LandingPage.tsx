import React from 'react';
import {
  Bell,
  CheckCircle2,
  Users,
  Calendar,
  FileCheck,
  ShieldCheck,
  Heart,
  ArrowRight,
  Eye,
  Volume2,
  Sparkles,
  Lock,
  ChevronRight,
  Clock
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
  onQuickDemoPatient: () => void;
  onQuickDemoCaregiver: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreFeatures,
  onQuickDemoPatient,
  onQuickDemoCaregiver
}) => {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Clean metadata kicker - Zero Pill */}
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-widest">
                <span>Healthcare Technology</span>
                <span aria-hidden="true">·</span>
                <span>Designed for Older Adults & Loved Ones</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1E3326] leading-[1.15] text-balance">
                Never Miss Your Medicine. <br className="hidden sm:inline" />
                <span className="text-[#F95518]">Never Care Alone.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
                Your medicines, reminders, and family support in one simple place. Stay on schedule and keep the people you trust connected.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-7 py-4 text-base font-bold text-white bg-[#F95518] hover:bg-[#e0470f] rounded-2xl shadow-md transition-all flex items-center gap-2.5 hover:shadow-lg active:scale-95"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={onQuickDemoPatient}
                  className="px-7 py-4 text-base font-bold text-[#1E3326] bg-white hover:bg-slate-50 border-2 border-[#1E3326] rounded-2xl transition-all shadow-xs flex items-center gap-2"
                >
                  <Eye className="w-5 h-5 text-teal-700" />
                  <span>Try Eleanor's Demo</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-semibold border-t border-[#EAE4D8]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Private & Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#F95518]" />
                  <span>Senior Usability First</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>Patient-Granted Consent</span>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Image + Interactive Card Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white">
                <img
                  src="/src/assets/images/hero_elder_health_1793768036992.jpg"
                  alt="Healthy, joyful older adult Eleanor smiling peacefully with a glass of water in her morning kitchen"
                  className="w-full h-[380px] sm:h-[440px] object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />

                {/* Overlaid Floating Card: Live Reminder Sample */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#FAF8F5]/95 backdrop-blur-md p-4 rounded-2xl border border-[#E8E2D8] shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1E3326] text-[#F95518] flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase">
                          <span>Next Scheduled Dose</span>
                          <span>·</span>
                          <span className="text-teal-800">8:00 AM</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 leading-tight">
                          Lisinopril 10 mg
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg shrink-0">
                      Due Now
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 font-medium line-clamp-1">
                    Take 1 tablet every morning with a full glass of water.
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={onQuickDemoPatient}
                      className="py-2 px-3 text-xs font-bold text-white bg-[#1E3326] hover:bg-[#15251C] rounded-xl text-center"
                    >
                      Confirm Taken
                    </button>
                    <button
                      onClick={onQuickDemoPatient}
                      className="py-2 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl text-center"
                    >
                      Snooze 10m
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-2">
            Features Built For Clarity & Compassion
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1E3326] tracking-tight">
            Designed for Simplicity. Engineered for Safety.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3">
            Every screen and button is tailored for effortless use by older adults, with respectful transparency for caregivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E2D8] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mb-5">
              <Bell className="w-6 h-6 text-teal-700" />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
              1. Smart Medicine Reminders
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Timely reminders check schedules every 15 seconds. Gentle audio, large high-contrast dialogs, and clear one-click confirmations.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E2D8] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F95518] flex items-center justify-center mb-5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
              2. Easy Dose Tracking
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A single tap marks a dose as taken. Snooze when you need a few extra minutes, or record as not yet confirmed. Never labeled 'missed'.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E2D8] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-5">
              <Users className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
              3. Family Care
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Invite family members and caregivers with explicit patient-controlled permissions. Caregivers can verify safety without invading privacy.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E2D8] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
              4. Daily Health Schedule
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Clear visual timeline grouped into Morning, Afternoon, and Evening slots. Know exactly what medicine comes next throughout your day.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E2D8] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mb-5">
              <FileCheck className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
              5. Prescription Management
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Keep verified doctor prescriptions (PDFs & images up to 5MB) attached directly to each medicine. Kept private to the patient.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E2D8] shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center mb-5">
              <Volume2 className="w-6 h-6 text-purple-700" />
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">
              6. Accessibility for Everyone
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Includes Easy Mode (large 20px typography & 52px touch targets), High Contrast mode, and browser Voice Help to read schedules out loud.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 bg-[#F4EFE6] border-y border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-2">
              Step-by-Step Simplicity
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1E3326]">
              How MediTrack Keeps You On Schedule
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Add Medicines',
                desc: 'Enter prescribed names, dosages, and doctor instructions.'
              },
              {
                step: '02',
                title: 'Set Reminder Times',
                desc: 'Pick your preferred morning, afternoon, or evening reminder times.'
              },
              {
                step: '03',
                title: 'Receive Reminders',
                desc: 'Clear, gentle dialogs and voice assistance announce each dose.'
              },
              {
                step: '04',
                title: 'Confirm Doses',
                desc: 'Tap one large button to confirm you took your medicine.'
              },
              {
                step: '05',
                title: 'Share With Family',
                desc: 'Keep daughter, son, or caregiver updated automatically.'
              }
            ].map((item) => (
              <div key={item.step} className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs relative">
                <div className="text-2xl font-black text-[#F95518] mb-3">
                  {item.step}
                </div>
                <h4 className="font-heading text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAMILY CARE SPOTLIGHT */}
      <section id="family-preview" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1E3326] text-white rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden relative shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                Patient-Controlled Family Link
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Peace of mind for you. Confidence for your family.
              </h2>
              <p className="text-emerald-100 text-base sm:text-lg leading-relaxed">
                MediTrack puts the patient in total command. Invite family members or caregivers to view your daily confirmations. You can pause alerts, customize quiet hours, or stop sharing at any moment.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={onQuickDemoCaregiver}
                  className="px-6 py-3.5 bg-white text-[#1E3326] font-bold text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  View Sarah's Caregiver Portal
                </button>
                <button
                  onClick={onGetStarted}
                  className="px-6 py-3.5 bg-[#F95518] text-white font-bold text-sm rounded-xl hover:bg-[#e0470f] transition-colors"
                >
                  Set Up Family Link
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src="/src/assets/images/avatar_caregiver_sarah_1793768037048.jpg"
                  alt="Sarah Vance, loving caregiver daughter"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white/40"
                />
                <div>
                  <h4 className="font-bold text-base text-white">Sarah Vance</h4>
                  <p className="text-xs text-emerald-200">Daughter & Primary Caregiver</p>
                </div>
              </div>
              <p className="text-xs text-emerald-100 italic leading-relaxed">
                "Having MediTrack lets Mom stay independent in her own home. I can check that her morning heart medicine was taken without calling five times a day."
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
                <span>Access Status:</span>
                <span className="font-bold text-white uppercase tracking-wider">Granted by Eleanor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRIVACY & SECURITY */}
      <section className="py-12 bg-[#FAF8F5] border-t border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-teal-800" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-slate-900">
                  Patient First Privacy
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Only the patient can grant or revoke sharing. Caregivers cannot alter medicines or prescriptions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-slate-900">
                  Community Contact Protection
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Community contacts receive only check-in requests. Medicine names and health records are never disclosed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-slate-900">
                  Private Document Storage
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Prescription attachments are stored in private containers and are never shared without explicit authorization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-[#1E3326] text-white pt-12 pb-8 border-t border-[#2A4735]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#2D4C39]">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#F95518] text-white flex items-center justify-center font-bold">
                  M
                </div>
                <span className="font-heading text-xl font-bold tracking-tight text-white">
                  MediTrack
                </span>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Never Miss Your Medicine. Never Care Alone. A dedicated health technology platform by MediSquad.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">
                Features
              </h5>
              <ul className="space-y-2 text-xs text-emerald-100">
                <li><button onClick={onQuickDemoPatient} className="hover:text-white">Smart Reminders</button></li>
                <li><button onClick={onQuickDemoPatient} className="hover:text-white">Daily Schedule</button></li>
                <li><button onClick={onQuickDemoPatient} className="hover:text-white">Adherence History</button></li>
                <li><button onClick={onQuickDemoCaregiver} className="hover:text-white">Caregiver Portal</button></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">
                Accessibility
              </h5>
              <ul className="space-y-2 text-xs text-emerald-100">
                <li><span>Easy Mode (20px Text)</span></li>
                <li><span>High Contrast Display</span></li>
                <li><span>Speech Synthesis Help</span></li>
                <li><span>Screen Reader Tested</span></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">
                Safety & Privacy
              </h5>
              <p className="text-xs text-emerald-100 leading-relaxed">
                MediTrack is a schedule adherence application, not a medical provider. Always consult your prescribing doctor or pharmacist for clinical advice.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200 gap-4">
            <div>
              © 2026 MediTrack (MediSquad). MediTrack PRD v1.1. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>·</span>
              <span>Terms of Service</span>
              <span>·</span>
              <span>HIPAA Compliant Architecture</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
