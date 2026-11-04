import {
  User,
  Medicine,
  MedicineSchedule,
  DoseLog,
  CaregiverConnection,
  NotificationRecipient,
  NotificationEvent,
  NotificationSettings,
  AccessibilitySettings,
  PrescriptionDocument,
  TimeSlot,
  DoseStatus
} from '../types';

const STORAGE_KEYS = {
  USER: 'meditrack_current_user',
  MEDICINES: 'meditrack_medicines',
  SCHEDULES: 'meditrack_schedules',
  DOSE_LOGS: 'meditrack_dose_logs',
  CAREGIVER_CONNS: 'meditrack_caregiver_connections',
  DOCUMENTS: 'meditrack_documents',
  RECIPIENTS: 'meditrack_notification_recipients',
  EVENTS: 'meditrack_notification_events',
  NOTIF_SETTINGS: 'meditrack_notification_settings',
  ACCESSIBILITY: 'meditrack_accessibility',
  AI_CONSENT: 'meditrack_ai_consent',
  INITIALIZED: 'meditrack_initialized_v2'
};

export const DEFAULT_PATIENT: User = {
  id: 'patient-eleanor-001',
  email: 'eleanor.vance@example.com',
  fullName: 'Eleanor Vance',
  role: 'patient',
  phone: '(555) 234-5678',
  avatarUrl: '/src/assets/images/avatar_patient_eleanor_1793768037524.jpg',
  emergencyContact: 'Sarah Vance (Daughter) - (555) 876-5432',
  createdAt: '2026-10-15T08:00:00Z'
};

export const DEFAULT_CAREGIVER: User = {
  id: 'caregiver-sarah-002',
  email: 'sarah.vance@example.com',
  fullName: 'Sarah Vance',
  role: 'caregiver',
  phone: '(555) 876-5432',
  avatarUrl: '/src/assets/images/avatar_caregiver_sarah_1793768037048.jpg',
  emergencyContact: 'Local Emergency 911',
  createdAt: '2026-10-16T09:00:00Z'
};

export function getTimeSlot(timeStr: string): TimeSlot {
  const [hourStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  return 'evening';
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeSlotLabel(slot: TimeSlot): string {
  switch (slot) {
    case 'morning':
      return 'Morning (6:00 AM – 11:00 AM)';
    case 'afternoon':
      return 'Afternoon (11:00 AM – 5:00 PM)';
    case 'evening':
      return 'Evening (5:00 PM onwards)';
  }
}

// Generate default mock data for Eleanor
function seedInitialData() {
  const today = getTodayDateString();

  const initialMedicines: Medicine[] = [
    {
      id: 'med-1',
      userId: DEFAULT_PATIENT.id,
      name: 'Lisinopril',
      dosage: '10 mg',
      instructions: 'Take 1 tablet every morning with a full glass of water.',
      startDate: '2026-09-01',
      reminderTimes: ['08:00'],
      isActive: true,
      notes: 'For blood pressure. Prescribed by Dr. Henderson.',
      prescriptionFilename: 'Prescription_Lisinopril_DrHenderson.pdf',
      createdAt: '2026-09-01T08:00:00Z'
    },
    {
      id: 'med-2',
      userId: DEFAULT_PATIENT.id,
      name: 'Metformin',
      dosage: '500 mg',
      instructions: 'Take 1 tablet with meals (breakfast & dinner).',
      startDate: '2026-08-15',
      reminderTimes: ['08:30', '19:00'],
      isActive: true,
      notes: 'Blood sugar management. Do not take on an empty stomach.',
      createdAt: '2026-08-15T08:00:00Z'
    },
    {
      id: 'med-3',
      userId: DEFAULT_PATIENT.id,
      name: 'Vitamin D3',
      dosage: '1000 IU',
      instructions: 'Take 1 softgel capsule with lunch.',
      startDate: '2026-10-01',
      reminderTimes: ['13:00'],
      isActive: true,
      notes: 'Bone strength supplement.',
      createdAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'med-4',
      userId: DEFAULT_PATIENT.id,
      name: 'Atorvastatin',
      dosage: '20 mg',
      instructions: 'Take 1 tablet at night before bedtime.',
      startDate: '2026-09-10',
      reminderTimes: ['21:00'],
      isActive: true,
      notes: 'Cholesterol support. Avoid grapefruit juice.',
      createdAt: '2026-09-10T08:00:00Z'
    }
  ];

  const initialSchedules: MedicineSchedule[] = [
    { id: 'sch-1', medicineId: 'med-1', userId: DEFAULT_PATIENT.id, reminderTime: '08:00', slot: 'morning' },
    { id: 'sch-2', medicineId: 'med-2', userId: DEFAULT_PATIENT.id, reminderTime: '08:30', slot: 'morning' },
    { id: 'sch-3', medicineId: 'med-3', userId: DEFAULT_PATIENT.id, reminderTime: '13:00', slot: 'afternoon' },
    { id: 'sch-4', medicineId: 'med-2', userId: DEFAULT_PATIENT.id, reminderTime: '19:00', slot: 'evening' },
    { id: 'sch-5', medicineId: 'med-4', userId: DEFAULT_PATIENT.id, reminderTime: '21:00', slot: 'evening' }
  ];

  // Generate dose logs for the past 6 days + today
  const initialLogs: DoseLog[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() - i);
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    const isToday = i === 0;

    // Morning Lisinopril
    initialLogs.push({
      id: `log-lisinopril-${dateStr}`,
      scheduleId: 'sch-1',
      medicineId: 'med-1',
      medicineName: 'Lisinopril',
      dosage: '10 mg',
      instructions: 'Take 1 tablet every morning with a full glass of water.',
      userId: DEFAULT_PATIENT.id,
      scheduledDate: dateStr,
      scheduledTime: '08:00',
      status: 'taken',
      takenAt: `${dateStr}T08:05:00Z`,
      createdAt: `${dateStr}T08:00:00Z`,
      slot: 'morning'
    });

    // Morning Metformin
    initialLogs.push({
      id: `log-metformin-am-${dateStr}`,
      scheduleId: 'sch-2',
      medicineId: 'med-2',
      medicineName: 'Metformin',
      dosage: '500 mg',
      instructions: 'Take 1 tablet with breakfast.',
      userId: DEFAULT_PATIENT.id,
      scheduledDate: dateStr,
      scheduledTime: '08:30',
      status: 'taken',
      takenAt: `${dateStr}T08:32:00Z`,
      createdAt: `${dateStr}T08:30:00Z`,
      slot: 'morning'
    });

    // Afternoon Vitamin D3
    initialLogs.push({
      id: `log-vitd-${dateStr}`,
      scheduleId: 'sch-3',
      medicineId: 'med-3',
      medicineName: 'Vitamin D3',
      dosage: '1000 IU',
      instructions: 'Take 1 softgel capsule with lunch.',
      userId: DEFAULT_PATIENT.id,
      scheduledDate: dateStr,
      scheduledTime: '13:00',
      status: isToday ? 'pending' : (i === 2 ? 'not_confirmed' : 'taken'),
      takenAt: isToday ? undefined : (i === 2 ? undefined : `${dateStr}T13:10:00Z`),
      createdAt: `${dateStr}T13:00:00Z`,
      slot: 'afternoon'
    });

    // Evening Metformin
    initialLogs.push({
      id: `log-metformin-pm-${dateStr}`,
      scheduleId: 'sch-4',
      medicineId: 'med-2',
      medicineName: 'Metformin',
      dosage: '500 mg',
      instructions: 'Take 1 tablet with dinner.',
      userId: DEFAULT_PATIENT.id,
      scheduledDate: dateStr,
      scheduledTime: '19:00',
      status: isToday ? 'pending' : 'taken',
      takenAt: isToday ? undefined : `${dateStr}T19:04:00Z`,
      createdAt: `${dateStr}T19:00:00Z`,
      slot: 'evening'
    });

    // Night Atorvastatin
    initialLogs.push({
      id: `log-atorvastatin-${dateStr}`,
      scheduleId: 'sch-5',
      medicineId: 'med-4',
      medicineName: 'Atorvastatin',
      dosage: '20 mg',
      instructions: 'Take 1 tablet at night before bedtime.',
      userId: DEFAULT_PATIENT.id,
      scheduledDate: dateStr,
      scheduledTime: '21:00',
      status: isToday ? 'pending' : 'taken',
      takenAt: isToday ? undefined : `${dateStr}T21:12:00Z`,
      createdAt: `${dateStr}T21:00:00Z`,
      slot: 'evening'
    });
  }

  const initialCaregivers: CaregiverConnection[] = [
    {
      id: 'conn-1',
      patientId: DEFAULT_PATIENT.id,
      caregiverEmail: 'sarah.vance@example.com',
      caregiverName: 'Sarah Vance',
      relationship: 'Daughter / Primary Caregiver',
      status: 'granted',
      canViewMedicines: true,
      canViewLogs: true,
      canReceiveAlerts: true,
      message: 'Always here to support mom with her medicine schedule.',
      createdAt: '2026-10-16T09:00:00Z'
    },
    {
      id: 'conn-2',
      patientId: DEFAULT_PATIENT.id,
      caregiverEmail: 'mark.vance@example.com',
      caregiverName: 'Mark Vance',
      relationship: 'Son',
      status: 'invited',
      canViewMedicines: true,
      canViewLogs: false,
      canReceiveAlerts: true,
      message: 'Family care link invite sent.',
      createdAt: '2026-10-28T14:00:00Z'
    }
  ];

  const initialRecipients: NotificationRecipient[] = [
    {
      id: 'rec-1',
      userId: DEFAULT_PATIENT.id,
      name: 'Sarah Vance',
      email: 'sarah.vance@example.com',
      phone: '(555) 876-5432',
      category: 'caregiver',
      escalationOrder: 1,
      waitingTimeMinutes: 30,
      isEnabled: true
    },
    {
      id: 'rec-2',
      userId: DEFAULT_PATIENT.id,
      name: 'Mark Vance',
      email: 'mark.vance@example.com',
      phone: '(555) 765-4321',
      category: 'family',
      escalationOrder: 2,
      waitingTimeMinutes: 45,
      isEnabled: true
    },
    {
      id: 'rec-3',
      userId: DEFAULT_PATIENT.id,
      name: 'Mrs. Dorothy Higgins (Neighbor)',
      email: 'dorothy.higgins@example.com',
      phone: '(555) 345-6789',
      category: 'community',
      escalationOrder: 3,
      waitingTimeMinutes: 60,
      isEnabled: true
    }
  ];

  const initialEvents: NotificationEvent[] = [
    {
      id: 'evt-1',
      userId: DEFAULT_PATIENT.id,
      recipientName: 'Sarah Vance',
      recipientCategory: 'caregiver',
      message: 'Morning medicines (Lisinopril & Metformin) confirmed on time.',
      status: 'sent',
      sentAt: `${today}T08:35:00Z`,
      createdAt: `${today}T08:35:00Z`
    }
  ];

  const initialNotifSettings: NotificationSettings = {
    defaultGracePeriodMinutes: 30,
    defaultSnoozeMinutes: 10,
    isAlertsPaused: false,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    browserNotificationsEnabled: true
  };

  const initialAccessibility: AccessibilitySettings = {
    easyMode: false,
    highContrast: false,
    voiceHelp: false,
    reducedMotion: false
  };

  const initialDocuments: PrescriptionDocument[] = [
    {
      id: 'doc-1',
      userId: DEFAULT_PATIENT.id,
      medicineId: 'med-1',
      medicineName: 'Lisinopril',
      filename: 'Prescription_Lisinopril_DrHenderson.pdf',
      fileUrl: '#prescription-view',
      fileSize: 1420000,
      fileType: 'application/pdf',
      uploadedAt: '2026-09-01T09:30:00Z'
    }
  ];

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_PATIENT));
  localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(initialMedicines));
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(initialSchedules));
  localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(initialLogs));
  localStorage.setItem(STORAGE_KEYS.CAREGIVER_CONNS, JSON.stringify(initialCaregivers));
  localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(initialRecipients));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initialEvents));
  localStorage.setItem(STORAGE_KEYS.NOTIF_SETTINGS, JSON.stringify(initialNotifSettings));
  localStorage.setItem(STORAGE_KEYS.ACCESSIBILITY, JSON.stringify(initialAccessibility));
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(initialDocuments));
  localStorage.setItem(STORAGE_KEYS.AI_CONSENT, JSON.stringify(true));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

export const StorageService = {
  init() {
    if (typeof window === 'undefined') return;
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      seedInitialData();
    }
    // Also apply accessibility classes to documentElement
    const accessibility = this.getAccessibility();
    this.applyAccessibilityClasses(accessibility);
  },

  resetToDemo() {
    seedInitialData();
  },

  getCurrentUser(): User {
    if (typeof window === 'undefined') return DEFAULT_PATIENT;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : DEFAULT_PATIENT;
  },

  setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getMedicines(): Medicine[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
    return data ? JSON.parse(data) : [];
  },

  saveMedicine(medicine: Medicine): Medicine {
    const list = this.getMedicines();
    const index = list.findIndex(m => m.id === medicine.id);
    if (index >= 0) {
      list[index] = medicine;
    } else {
      list.push(medicine);
    }
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(list));

    // Update schedules for this medicine
    this.updateSchedulesForMedicine(medicine);
    // Ensure today's dose logs exist for this medicine
    this.ensureTodayDoseLogs();
    return medicine;
  },

  deleteMedicine(id: string) {
    const list = this.getMedicines().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(list));

    const schedules = this.getSchedules().filter(s => s.medicineId !== id);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));

    const logs = this.getDoseLogs().filter(l => l.medicineId !== id);
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
  },

  getSchedules(): MedicineSchedule[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return data ? JSON.parse(data) : [];
  },

  updateSchedulesForMedicine(medicine: Medicine) {
    let schedules = this.getSchedules().filter(s => s.medicineId !== medicine.id);
    const newSchedules: MedicineSchedule[] = medicine.reminderTimes.map((time, idx) => ({
      id: `sch-${medicine.id}-${idx}`,
      medicineId: medicine.id,
      userId: medicine.userId,
      reminderTime: time,
      slot: getTimeSlot(time)
    }));
    schedules = [...schedules, ...newSchedules];
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  },

  getDoseLogs(): DoseLog[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
    return data ? JSON.parse(data) : [];
  },

  saveDoseLog(log: DoseLog): DoseLog {
    const logs = this.getDoseLogs();
    const index = logs.findIndex(l => l.id === log.id);
    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.push(log);
    }
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
    return log;
  },

  markDoseTaken(logId: string, notes?: string): DoseLog | null {
    const logs = this.getDoseLogs();
    const log = logs.find(l => l.id === logId);
    if (!log) return null;

    log.status = 'taken';
    log.takenAt = new Date().toISOString();
    if (notes) log.notes = notes;
    log.snoozedUntil = undefined;

    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));

    // Cancel any pending escalation notification events for this dose
    this.cancelEscalationForDose(log.id);

    return log;
  },

  snoozeDose(logId: string, minutes = 10): DoseLog | null {
    const logs = this.getDoseLogs();
    const log = logs.find(l => l.id === logId);
    if (!log) return null;

    const snoozeTarget = new Date();
    snoozeTarget.setMinutes(snoozeTarget.getMinutes() + minutes);

    log.status = 'snoozed';
    log.snoozedUntil = snoozeTarget.toISOString();

    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
    return log;
  },

  markDoseNotYetConfirmed(logId: string): DoseLog | null {
    const logs = this.getDoseLogs();
    const log = logs.find(l => l.id === logId);
    if (!log) return null;

    log.status = 'not_confirmed';
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
    return log;
  },

  ensureTodayDoseLogs(): DoseLog[] {
    const today = getTodayDateString();
    const medicines = this.getMedicines().filter(m => m.isActive);
    const schedules = this.getSchedules();
    const logs = this.getDoseLogs();

    let updated = false;

    for (const med of medicines) {
      const medSchedules = schedules.filter(s => s.medicineId === med.id);
      for (const sch of medSchedules) {
        const existing = logs.find(
          l => l.medicineId === med.id && l.scheduledDate === today && l.scheduledTime === sch.reminderTime
        );
        if (!existing) {
          const newLog: DoseLog = {
            id: `log-${med.id}-${today}-${sch.reminderTime.replace(':', '')}`,
            scheduleId: sch.id,
            medicineId: med.id,
            medicineName: med.name,
            dosage: med.dosage,
            instructions: med.instructions,
            userId: med.userId,
            scheduledDate: today,
            scheduledTime: sch.reminderTime,
            status: 'pending',
            slot: sch.slot,
            createdAt: new Date().toISOString()
          };
          logs.push(newLog);
          updated = true;
        }
      }
    }

    if (updated) {
      localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
    }
    return logs.filter(l => l.scheduledDate === today);
  },

  getCaregiverConnections(): CaregiverConnection[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CAREGIVER_CONNS);
    return data ? JSON.parse(data) : [];
  },

  saveCaregiverConnection(conn: CaregiverConnection): CaregiverConnection {
    const list = this.getCaregiverConnections();
    const index = list.findIndex(c => c.id === conn.id);
    if (index >= 0) {
      list[index] = conn;
    } else {
      list.push(conn);
    }
    localStorage.setItem(STORAGE_KEYS.CAREGIVER_CONNS, JSON.stringify(list));
    return conn;
  },

  updateConnectionStatus(connId: string, status: CaregiverConnection['status']) {
    const list = this.getCaregiverConnections();
    const conn = list.find(c => c.id === connId);
    if (conn) {
      conn.status = status;
      localStorage.setItem(STORAGE_KEYS.CAREGIVER_CONNS, JSON.stringify(list));
    }
  },

  removeCaregiverConnection(connId: string) {
    const list = this.getCaregiverConnections().filter(c => c.id !== connId);
    localStorage.setItem(STORAGE_KEYS.CAREGIVER_CONNS, JSON.stringify(list));
  },

  getNotificationRecipients(): NotificationRecipient[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.RECIPIENTS);
    return data ? JSON.parse(data) : [];
  },

  saveNotificationRecipient(recipient: NotificationRecipient): NotificationRecipient {
    const list = this.getNotificationRecipients();
    const index = list.findIndex(r => r.id === recipient.id);
    if (index >= 0) {
      list[index] = recipient;
    } else {
      list.push(recipient);
    }
    localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(list));
    return recipient;
  },

  removeNotificationRecipient(id: string) {
    const list = this.getNotificationRecipients().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(list));
  },

  getNotificationEvents(): NotificationEvent[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  },

  addNotificationEvent(event: NotificationEvent) {
    const list = this.getNotificationEvents();
    list.unshift(event);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(list));
  },

  cancelEscalationForDose(doseId: string) {
    const events = this.getNotificationEvents();
    events.forEach(evt => {
      if (evt.doseId === doseId && evt.status === 'pending') {
        evt.status = 'cancelled';
      }
    });
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  },

  getNotificationSettings(): NotificationSettings {
    if (typeof window === 'undefined') {
      return {
        defaultGracePeriodMinutes: 30,
        defaultSnoozeMinutes: 10,
        isAlertsPaused: false,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        browserNotificationsEnabled: true
      };
    }
    const data = localStorage.getItem(STORAGE_KEYS.NOTIF_SETTINGS);
    return data ? JSON.parse(data) : {
      defaultGracePeriodMinutes: 30,
      defaultSnoozeMinutes: 10,
      isAlertsPaused: false,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      browserNotificationsEnabled: true
    };
  },

  saveNotificationSettings(settings: NotificationSettings) {
    localStorage.setItem(STORAGE_KEYS.NOTIF_SETTINGS, JSON.stringify(settings));
  },

  getAccessibility(): AccessibilitySettings {
    if (typeof window === 'undefined') {
      return { easyMode: false, highContrast: false, voiceHelp: false, reducedMotion: false };
    }
    const data = localStorage.getItem(STORAGE_KEYS.ACCESSIBILITY);
    return data ? JSON.parse(data) : { easyMode: false, highContrast: false, voiceHelp: false, reducedMotion: false };
  },

  saveAccessibility(settings: AccessibilitySettings) {
    localStorage.setItem(STORAGE_KEYS.ACCESSIBILITY, JSON.stringify(settings));
    this.applyAccessibilityClasses(settings);
  },

  applyAccessibilityClasses(settings: AccessibilitySettings) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (settings.easyMode) {
      root.classList.add('easy-mode');
    } else {
      root.classList.remove('easy-mode');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  },

  getDocuments(): PrescriptionDocument[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : [];
  },

  saveDocument(doc: PrescriptionDocument) {
    const list = this.getDocuments();
    list.unshift(doc);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(list));
  },

  removeDocument(id: string) {
    const list = this.getDocuments().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(list));
  },

  getAiConsent(): boolean {
    if (typeof window === 'undefined') return false;
    const data = localStorage.getItem(STORAGE_KEYS.AI_CONSENT);
    return data ? JSON.parse(data) : false;
  },

  setAiConsent(val: boolean) {
    localStorage.setItem(STORAGE_KEYS.AI_CONSENT, JSON.stringify(val));
  }
};
