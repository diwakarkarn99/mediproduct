import { DoseLog, Medicine, ActiveReminder } from '../types';
import { StorageService, getTodayDateString } from './storageService';

type ReminderListener = (reminder: ActiveReminder | null) => void;

class ReminderEngineClass {
  private intervalId: number | null = null;
  private listeners: Set<ReminderListener> = new Set();
  private activeReminder: ActiveReminder | null = null;
  private promptedDosesToday: Set<string> = new Set();
  private isChecking = false;

  public init() {
    if (typeof window === 'undefined') return;

    // Check immediately on startup
    this.checkSchedules();

    // Clear any previous interval and set 15-second interval
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    this.intervalId = window.setInterval(() => {
      this.checkSchedules();
    }, 15000);
  }

  public subscribe(listener: ReminderListener): () => void {
    this.listeners.add(listener);
    // Send current active reminder if any
    listener(this.activeReminder);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getActiveReminder(): ActiveReminder | null {
    return this.activeReminder;
  }

  public async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  public speak(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const accessibility = StorageService.getAccessibility();
    if (!accessibility.voiceHelp) return;

    try {
      window.speechSynthesis.cancel(); // Stop prior utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower, very friendly and clear for seniors
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Graceful fallback if speech synthesis is blocked
    }
  }

  public checkSchedules() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const today = getTodayDateString();
      const logs = StorageService.ensureTodayDoseLogs();
      const medicines = StorageService.getMedicines();
      const now = new Date();

      const currentMinutesToday = now.getHours() * 60 + now.getMinutes();

      for (const log of logs) {
        if (log.scheduledDate !== today) continue;

        const [hours, minutes] = log.scheduledTime.split(':').map(Number);
        const scheduledMinutes = hours * 60 + minutes;
        const diffMinutes = currentMinutesToday - scheduledMinutes;

        // Rule: Over 2 hours (120 minutes) unanswered -> Mark as 'not_confirmed'
        if (log.status === 'pending' && diffMinutes > 120) {
          StorageService.markDoseNotYetConfirmed(log.id);
          continue;
        }

        // Rule: Check if dose is due now
        // A dose is due if:
        // 1. Status is pending, diffMinutes >= 0 and diffMinutes <= 120, and hasn't been prompted yet in this session
        // 2. OR status is snoozed and snoozedUntil is in the past
        let isDue = false;

        if (log.status === 'pending' && diffMinutes >= 0 && diffMinutes <= 120) {
          if (!this.promptedDosesToday.has(log.id) && (!this.activeReminder || this.activeReminder.dose.id !== log.id)) {
            isDue = true;
          }
        } else if (log.status === 'snoozed' && log.snoozedUntil) {
          const snoozeDate = new Date(log.snoozedUntil);
          if (now >= snoozeDate && (!this.activeReminder || this.activeReminder.dose.id !== log.id)) {
            isDue = true;
          }
        }

        if (isDue && !this.activeReminder) {
          const medicine = medicines.find(m => m.id === log.medicineId);
          if (medicine && medicine.isActive) {
            this.triggerReminder(log, medicine);
            break; // Trigger one dialog at a time to prevent overwhelming older adults
          }
        }
      }
    } finally {
      this.isChecking = false;
    }
  }

  private triggerReminder(dose: DoseLog, medicine: Medicine) {
    this.promptedDosesToday.add(dose.id);

    const reminder: ActiveReminder = {
      dose,
      medicine,
      dueTimeText: dose.scheduledTime
    };

    this.activeReminder = reminder;
    this.notifyListeners();

    // Voice announcement if Voice Help enabled
    this.speak(`Time for your medicine: ${medicine.name}, ${medicine.dosage}. Instructions: ${medicine.instructions}`);

    // Send Browser Notification
    this.sendBrowserNotification(medicine, dose);
  }

  private sendBrowserNotification(medicine: Medicine, dose: DoseLog) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const notifSettings = StorageService.getNotificationSettings();
    if (!notifSettings.browserNotificationsEnabled) return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(`Time for your medicine: ${medicine.name}`, {
          body: `${medicine.dosage} scheduled for ${dose.scheduledTime}.\n${medicine.instructions}`,
          icon: '/favicon.ico',
          tag: `dose-${dose.id}`,
          requireInteraction: true
        });
      } catch {
        // Fallback for environments with strict service-worker requirements
      }
    }
  }

  public handleTaken(logId: string, notes?: string) {
    const updated = StorageService.markDoseTaken(logId, notes);
    if (updated) {
      this.speak(`Great job! ${updated.medicineName} marked as taken.`);
    }
    this.dismissActiveReminder();
    this.checkSchedules();
  }

  public handleSnooze(logId: string, minutes?: number) {
    const settings = StorageService.getNotificationSettings();
    const duration = minutes || settings.defaultSnoozeMinutes || 10;
    StorageService.snoozeDose(logId, duration);
    this.speak(`Reminder snoozed for ${duration} minutes.`);
    this.dismissActiveReminder();
  }

  public handleNotYetTaken(logId: string) {
    StorageService.markDoseNotYetConfirmed(logId);
    this.speak(`Medicine recorded as not yet confirmed.`);
    this.dismissActiveReminder();
  }

  public triggerManualTestReminder() {
    const logs = StorageService.ensureTodayDoseLogs();
    const medicines = StorageService.getMedicines();
    if (logs.length > 0 && medicines.length > 0) {
      const targetLog = logs[0];
      const targetMed = medicines.find(m => m.id === targetLog.medicineId) || medicines[0];
      this.triggerReminder(targetLog, targetMed);
    }
  }

  public dismissActiveReminder() {
    this.activeReminder = null;
    this.notifyListeners();
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.activeReminder);
      } catch (err) {
        console.error('Error notifying reminder listener:', err);
      }
    }
  }

  public destroy() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
  }
}

export const ReminderEngine = new ReminderEngineClass();
