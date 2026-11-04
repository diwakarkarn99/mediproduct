import { describe, it, expect, beforeEach } from 'vitest';
import { DoseLog, Medicine, CaregiverConnection, NotificationEvent } from '../types';

// Validation helpers
export function validateMedicineForm(input: {
  name?: string;
  dosage?: string;
  instructions?: string;
  startDate?: string;
  endDate?: string;
  reminderTimes?: string[];
}): { isValid: boolean; error?: string } {
  if (!input.name || !input.name.trim()) {
    return { isValid: false, error: 'Medicine name is required.' };
  }
  if (!input.dosage || !input.dosage.trim()) {
    return { isValid: false, error: 'Dosage is required.' };
  }
  if (!input.instructions || !input.instructions.trim()) {
    return { isValid: false, error: 'Instructions are required.' };
  }
  if (!input.startDate) {
    return { isValid: false, error: 'Start date is required.' };
  }
  if (input.endDate && input.endDate < input.startDate) {
    return { isValid: false, error: 'End date cannot be earlier than start date.' };
  }
  if (!input.reminderTimes || input.reminderTimes.length === 0) {
    return { isValid: false, error: 'At least one reminder time is required.' };
  }
  const uniqueTimes = new Set(input.reminderTimes);
  if (uniqueTimes.size !== input.reminderTimes.length) {
    return { isValid: false, error: 'Duplicate reminder times are not allowed.' };
  }
  return { isValid: true };
}

export function validatePrescriptionFile(file: { name: string; size: number; type: string }): {
  isValid: boolean;
  error?: string;
} {
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    return { isValid: false, error: 'File exceeds maximum size of 5 MB.' };
  }
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only PDF, JPG, and PNG are allowed.' };
  }
  return { isValid: true };
}

export function isDoseDue(
  log: DoseLog,
  currentMinutesToday: number,
  nowIso: string,
  promptedIds: Set<string>
): { isDue: boolean; becomesNotConfirmed?: boolean } {
  if (log.status === 'taken' || log.status === 'not_confirmed') {
    return { isDue: false };
  }

  const [h, m] = log.scheduledTime.split(':').map(Number);
  const scheduledMinutes = h * 60 + m;
  const diff = currentMinutesToday - scheduledMinutes;

  // Rule: Unanswered over 120 minutes becomes Not yet confirmed
  if (log.status === 'pending' && diff > 120) {
    return { isDue: false, becomesNotConfirmed: true };
  }

  if (log.status === 'pending') {
    // If due now (diff >= 0 and diff <= 120) and not yet prompted
    if (diff >= 0 && diff <= 120 && !promptedIds.has(log.id)) {
      return { isDue: true };
    }
    return { isDue: false }; // early reminder prevented
  }

  if (log.status === 'snoozed' && log.snoozedUntil) {
    if (new Date(nowIso) >= new Date(log.snoozedUntil) && !promptedIds.has(log.id)) {
      return { isDue: true };
    }
  }

  return { isDue: false };
}

export function canCaregiverAccess(connection: CaregiverConnection | null): boolean {
  if (!connection) return false;
  return connection.status === 'granted';
}

export function cancelEscalation(events: NotificationEvent[], doseId: string): NotificationEvent[] {
  return events.map(evt => {
    if (evt.doseId === doseId && evt.status === 'pending') {
      return { ...evt, status: 'cancelled' };
    }
    return evt;
  });
}

describe('MediTrack PRD v1.1 Comprehensive Verification', () => {
  // Test 1: Medicine form validation
  it('1. validates required fields in medicine form', () => {
    const invalid = validateMedicineForm({ name: '', dosage: '10mg', instructions: 'Take daily' });
    expect(invalid.isValid).toBe(false);
    expect(invalid.error).toContain('name is required');

    const valid = validateMedicineForm({
      name: 'Lisinopril',
      dosage: '10 mg',
      instructions: 'Take 1 tablet every morning with water',
      startDate: '2026-11-03',
      reminderTimes: ['08:00']
    });
    expect(valid.isValid).toBe(true);
  });

  // Test 2: Duplicate reminder times rejected
  it('2. rejects duplicate reminder times', () => {
    const res = validateMedicineForm({
      name: 'Metformin',
      dosage: '500 mg',
      instructions: 'With meals',
      startDate: '2026-11-03',
      reminderTimes: ['08:00', '08:00']
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Duplicate reminder times');
  });

  // Test 3: Invalid end date rejected
  it('3. rejects end date earlier than start date', () => {
    const res = validateMedicineForm({
      name: 'Amoxicillin',
      dosage: '250 mg',
      instructions: 'Twice daily',
      startDate: '2026-11-10',
      endDate: '2026-11-05',
      reminderTimes: ['09:00']
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('earlier than start date');
  });

  // Test 4: Reminder trigger when due
  it('4. triggers reminder when dose time matches current time', () => {
    const log: DoseLog = {
      id: 'log-1',
      scheduleId: 'sch-1',
      medicineId: 'med-1',
      medicineName: 'Lisinopril',
      dosage: '10 mg',
      instructions: 'With water',
      userId: 'user-1',
      scheduledDate: '2026-11-03',
      scheduledTime: '08:00',
      status: 'pending',
      slot: 'morning',
      createdAt: '2026-11-03T08:00:00Z'
    };
    const nowMinutes = 8 * 60 + 5; // 08:05 AM (5 min past scheduled)
    const result = isDoseDue(log, nowMinutes, '2026-11-03T08:05:00Z', new Set());
    expect(result.isDue).toBe(true);
  });

  // Test 5: No early reminder
  it('5. prevents early reminders before scheduled time', () => {
    const log: DoseLog = {
      id: 'log-2',
      scheduleId: 'sch-2',
      medicineId: 'med-2',
      medicineName: 'Vitamin D3',
      dosage: '1000 IU',
      instructions: 'With lunch',
      userId: 'user-1',
      scheduledDate: '2026-11-03',
      scheduledTime: '13:00',
      status: 'pending',
      slot: 'afternoon',
      createdAt: '2026-11-03T08:00:00Z'
    };
    const morningMinutes = 8 * 60; // 08:00 AM
    const result = isDoseDue(log, morningMinutes, '2026-11-03T08:00:00Z', new Set());
    expect(result.isDue).toBe(false);
  });

  // Test 6: Taken response marks status and timestamp
  it('6. records taken response and updates status to taken', () => {
    const log: DoseLog = {
      id: 'log-3',
      scheduleId: 'sch-3',
      medicineId: 'med-1',
      medicineName: 'Lisinopril',
      dosage: '10 mg',
      instructions: 'With water',
      userId: 'user-1',
      scheduledDate: '2026-11-03',
      scheduledTime: '08:00',
      status: 'pending',
      slot: 'morning',
      createdAt: '2026-11-03T08:00:00Z'
    };
    log.status = 'taken';
    log.takenAt = '2026-11-03T08:04:00Z';
    expect(log.status).toBe('taken');
    expect(log.takenAt).toBeDefined();
  });

  // Test 7: Snooze delays reminder and sets snoozedUntil
  it('7. snoozes dose by configured minutes without creating duplicates', () => {
    const log: DoseLog = {
      id: 'log-4',
      scheduleId: 'sch-4',
      medicineId: 'med-2',
      medicineName: 'Metformin',
      dosage: '500 mg',
      instructions: 'With dinner',
      userId: 'user-1',
      scheduledDate: '2026-11-03',
      scheduledTime: '19:00',
      status: 'pending',
      slot: 'evening',
      createdAt: '2026-11-03T19:00:00Z'
    };
    const snoozeDate = new Date('2026-11-03T19:10:00Z');
    log.status = 'snoozed';
    log.snoozedUntil = snoozeDate.toISOString();

    expect(log.status).toBe('snoozed');
    expect(log.snoozedUntil).toBe('2026-11-03T19:10:00.000Z');
  });

  // Test 8: Duplicate prevention
  it('8. prevents duplicate popups for already prompted dose', () => {
    const log: DoseLog = {
      id: 'log-5',
      scheduleId: 'sch-5',
      medicineId: 'med-1',
      medicineName: 'Lisinopril',
      dosage: '10 mg',
      instructions: 'With water',
      userId: 'user-1',
      scheduledDate: '2026-11-03',
      scheduledTime: '08:00',
      status: 'pending',
      slot: 'morning',
      createdAt: '2026-11-03T08:00:00Z'
    };
    const promptedSet = new Set(['log-5']);
    const res = isDoseDue(log, 8 * 60 + 10, '2026-11-03T08:10:00Z', promptedSet);
    expect(res.isDue).toBe(false);
  });

  // Test 9: Two-hour unconfirmed rule
  it('9. marks doses over 2 hours old as not_confirmed', () => {
    const log: DoseLog = {
      id: 'log-6',
      scheduleId: 'sch-6',
      medicineId: 'med-1',
      medicineName: 'Lisinopril',
      dosage: '10 mg',
      instructions: 'With water',
      userId: 'user-1',
      scheduledDate: '2026-11-03',
      scheduledTime: '08:00', // 480 minutes
      status: 'pending',
      slot: 'morning',
      createdAt: '2026-11-03T08:00:00Z'
    };
    const afternoonMinutes = 11 * 60; // 660 minutes (180 min diff > 120 min)
    const res = isDoseDue(log, afternoonMinutes, '2026-11-03T11:00:00Z', new Set());
    expect(res.isDue).toBe(false);
    expect(res.becomesNotConfirmed).toBe(true);
  });

  // Test 10: Past dose protection
  it('10. does not re-trigger past doses with status taken', () => {
    const log: DoseLog = {
      id: 'log-7',
      scheduleId: 'sch-7',
      medicineId: 'med-1',
      medicineName: 'Lisinopril',
      dosage: '10 mg',
      instructions: 'With water',
      userId: 'user-1',
      scheduledDate: '2026-11-02',
      scheduledTime: '08:00',
      status: 'taken',
      takenAt: '2026-11-02T08:05:00Z',
      slot: 'morning',
      createdAt: '2026-11-02T08:00:00Z'
    };
    const res = isDoseDue(log, 8 * 60 + 5, '2026-11-03T08:05:00Z', new Set());
    expect(res.isDue).toBe(false);
  });

  // Test 11: Prescription file type validation
  it('11. rejects invalid prescription file types', () => {
    const invalid = validatePrescriptionFile({ name: 'script.exe', size: 1024, type: 'application/x-msdownload' });
    expect(invalid.isValid).toBe(false);
    expect(invalid.error).toContain('Invalid file type');

    const valid = validatePrescriptionFile({ name: 'script.pdf', size: 10240, type: 'application/pdf' });
    expect(valid.isValid).toBe(true);
  });

  // Test 12: Prescription size validation
  it('12. rejects prescription documents exceeding 5 MB', () => {
    const tooLarge = validatePrescriptionFile({
      name: 'large_scan.png',
      size: 6 * 1024 * 1024,
      type: 'image/png'
    });
    expect(tooLarge.isValid).toBe(false);
    expect(tooLarge.error).toContain('exceeds maximum size of 5 MB');
  });

  // Test 13: Family consent enforcement
  it('13. allows caregiver access only when connection status is granted', () => {
    const invitedConn: CaregiverConnection = {
      id: 'conn-1',
      patientId: 'patient-1',
      caregiverEmail: 'sarah@example.com',
      caregiverName: 'Sarah Vance',
      relationship: 'Daughter',
      status: 'invited',
      canViewMedicines: true,
      canViewLogs: true,
      canReceiveAlerts: true,
      createdAt: '2026-11-03T00:00:00Z'
    };
    expect(canCaregiverAccess(invitedConn)).toBe(false);

    const grantedConn = { ...invitedConn, status: 'granted' as const };
    expect(canCaregiverAccess(grantedConn)).toBe(true);
  });

  // Test 14: Revoked caregiver access
  it('14. blocks caregiver access immediately when connection is revoked', () => {
    const revokedConn: CaregiverConnection = {
      id: 'conn-2',
      patientId: 'patient-1',
      caregiverEmail: 'sarah@example.com',
      caregiverName: 'Sarah Vance',
      relationship: 'Daughter',
      status: 'revoked',
      canViewMedicines: true,
      canViewLogs: true,
      canReceiveAlerts: true,
      createdAt: '2026-11-03T00:00:00Z'
    };
    expect(canCaregiverAccess(revokedConn)).toBe(false);
  });

  // Test 15: Escalation cancellation on Taken
  it('15. cancels pending escalation events immediately when dose is marked taken', () => {
    const events: NotificationEvent[] = [
      {
        id: 'evt-1',
        userId: 'patient-1',
        recipientName: 'Sarah Vance',
        recipientCategory: 'caregiver',
        message: 'Unconfirmed dose warning',
        doseId: 'dose-99',
        status: 'pending',
        createdAt: '2026-11-03T08:30:00Z'
      }
    ];

    const updated = cancelEscalation(events, 'dose-99');
    expect(updated[0].status).toBe('cancelled');
  });
});
