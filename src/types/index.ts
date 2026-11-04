export type UserRole = 'patient' | 'caregiver';

export type DoseStatus = 'pending' | 'taken' | 'snoozed' | 'not_confirmed';

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export type ConnectionStatus = 'invited' | 'accepted' | 'granted' | 'revoked';

export type RecipientCategory = 'caregiver' | 'family' | 'community';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  instructions: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  notes?: string;
  prescriptionUrl?: string;
  prescriptionFilename?: string;
  isActive: boolean;
  reminderTimes: string[]; // ['08:00', '19:00']
  createdAt: string;
}

export interface MedicineSchedule {
  id: string;
  medicineId: string;
  userId: string;
  reminderTime: string; // HH:mm format
  slot: TimeSlot;
}

export interface DoseLog {
  id: string;
  scheduleId: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  instructions: string;
  userId: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: DoseStatus;
  takenAt?: string;
  snoozedUntil?: string;
  notes?: string;
  createdAt: string;
  slot: TimeSlot;
}

export interface CaregiverConnection {
  id: string;
  patientId: string;
  caregiverEmail: string;
  caregiverName: string;
  relationship: string;
  status: ConnectionStatus;
  message?: string;
  canViewMedicines: boolean;
  canViewLogs: boolean;
  canReceiveAlerts: boolean;
  createdAt: string;
}

export interface PrescriptionDocument {
  id: string;
  userId: string;
  medicineId?: string;
  medicineName?: string;
  filename: string;
  fileUrl: string;
  fileSize: number; // in bytes
  fileType: string;
  uploadedAt: string;
}

export interface NotificationRecipient {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  category: RecipientCategory;
  escalationOrder: number;
  waitingTimeMinutes: number; // default 30
  quietHoursStart?: string;
  quietHoursEnd?: string;
  isEnabled: boolean;
}

export interface NotificationEvent {
  id: string;
  userId: string;
  recipientId?: string;
  recipientName: string;
  recipientCategory: RecipientCategory;
  message: string;
  doseId?: string;
  status: 'pending' | 'sent' | 'cancelled';
  sentAt?: string;
  createdAt: string;
}

export interface NotificationSettings {
  defaultGracePeriodMinutes: number; // e.g. 30
  defaultSnoozeMinutes: number; // e.g. 10
  isAlertsPaused: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "07:00"
  browserNotificationsEnabled: boolean;
}

export interface AccessibilitySettings {
  easyMode: boolean;
  highContrast: boolean;
  voiceHelp: boolean;
  reducedMotion: boolean;
}

export interface ActiveReminder {
  dose: DoseLog;
  medicine: Medicine;
  dueTimeText: string;
}
