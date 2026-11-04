import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  FileCheck,
  AlertCircle,
  Clock,
  Calendar,
  Pill,
  Info
} from 'lucide-react';
import { Medicine } from '../../types';
import { StorageService, getTodayDateString } from '../../services/storageService';

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingMedicine?: Medicine | null;
}

export const MedicineFormModal: React.FC<MedicineFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editingMedicine
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00']);
  const [newTimeInput, setNewTimeInput] = useState('13:00');
  const [prescriptionFilename, setPrescriptionFilename] = useState<string | undefined>(undefined);
  const [prescriptionError, setPrescriptionError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editingMedicine) {
      setName(editingMedicine.name);
      setDosage(editingMedicine.dosage);
      setInstructions(editingMedicine.instructions);
      setStartDate(editingMedicine.startDate);
      setEndDate(editingMedicine.endDate || '');
      setNotes(editingMedicine.notes || '');
      setReminderTimes(editingMedicine.reminderTimes.length > 0 ? editingMedicine.reminderTimes : ['08:00']);
      setPrescriptionFilename(editingMedicine.prescriptionFilename);
    } else {
      setName('');
      setDosage('');
      setInstructions('');
      setStartDate(getTodayDateString());
      setEndDate('');
      setNotes('');
      setReminderTimes(['08:00']);
      setPrescriptionFilename(undefined);
    }
    setFormError('');
    setPrescriptionError('');
  }, [editingMedicine, isOpen]);

  if (!isOpen) return null;

  const handleAddTime = () => {
    if (!newTimeInput) return;
    if (reminderTimes.includes(newTimeInput)) {
      setFormError(`Reminder time ${newTimeInput} is already added. Duplicate times are not allowed.`);
      return;
    }
    setFormError('');
    setReminderTimes([...reminderTimes, newTimeInput].sort());
  };

  const handleRemoveTime = (timeToRemove: string) => {
    if (reminderTimes.length <= 1) {
      setFormError('At least one reminder time is required.');
      return;
    }
    setReminderTimes(reminderTimes.filter(t => t !== timeToRemove));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPrescriptionError('');
    if (!file) return;

    // Validate size (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPrescriptionError('File exceeds maximum size of 5 MB. Please select a smaller document.');
      return;
    }

    // Validate type (JPG, JPEG, PNG, PDF)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setPrescriptionError('Invalid file type. Please upload a PDF, PNG, or JPG document.');
      return;
    }

    // Save document metadata
    const user = StorageService.getCurrentUser();
    StorageService.saveDocument({
      id: `doc-${Date.now()}`,
      userId: user.id,
      filename: file.name,
      fileUrl: URL.createObjectURL(file),
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString()
    });

    setPrescriptionFilename(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Strict validation according to PRD
    if (!name.trim()) {
      setFormError('Medicine name is required.');
      return;
    }
    if (!dosage.trim()) {
      setFormError('Dosage is required (e.g., 10 mg, 500 mg, 1 tablet).');
      return;
    }
    if (!instructions.trim()) {
      setFormError('Doctor instructions are required (e.g., Take with breakfast and water).');
      return;
    }
    if (!startDate) {
      setFormError('Start date is required.');
      return;
    }
    if (endDate && endDate < startDate) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }
    if (reminderTimes.length === 0) {
      setFormError('At least one reminder time is required.');
      return;
    }

    const user = StorageService.getCurrentUser();

    const medicineData: Medicine = {
      id: editingMedicine ? editingMedicine.id : `med-${Date.now()}`,
      userId: user.id,
      name: name.trim(),
      dosage: dosage.trim(),
      instructions: instructions.trim(),
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
      reminderTimes,
      isActive: editingMedicine ? editingMedicine.isActive : true,
      prescriptionFilename,
      createdAt: editingMedicine ? editingMedicine.createdAt : new Date().toISOString()
    };

    StorageService.saveMedicine(medicineData);
    onSaved();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white border border-[#E8E2D8] rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#1E3326] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-100 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white">
                {editingMedicine ? 'Edit Prescribed Medicine' : 'Add Prescribed Medicine'}
              </h2>
              <p className="text-xs text-emerald-200">
                Enter details exactly as printed on your prescription label
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Safety Notice */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Safety Note:</strong> MediTrack does not calculate or recommend dosages. Always input the exact dosage and instructions given by your doctor or pharmacist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Medicine Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lisinopril, Metformin"
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F95518] focus:border-[#F95518] outline-none text-sm font-semibold min-h-[48px]"
              />
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Dosage & Strength *
              </label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 10 mg, 500 mg, 1 tablet"
                className="w-full px-4 py-3 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F95518] focus:border-[#F95518] outline-none text-sm font-semibold min-h-[48px]"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Doctor Instructions *
            </label>
            <textarea
              required
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take 1 tablet every morning with breakfast and a full glass of water."
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F95518] focus:border-[#F95518] outline-none text-sm"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F95518] outline-none text-sm min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F95518] outline-none text-sm min-h-[48px]"
              />
            </div>
          </div>

          {/* Reminder Times Management */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Daily Reminder Times *
                </label>
                <p className="text-[11px] text-slate-500">
                  You can set multiple reminder times per day (e.g. Morning & Evening)
                </p>
              </div>
            </div>

            {/* List of currently added times */}
            <div className="flex flex-wrap gap-2 pt-1">
              {reminderTimes.map((time) => (
                <div
                  key={time}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span>{time}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(time)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                    title={`Remove ${time}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add another time */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="time"
                value={newTimeInput}
                onChange={(e) => setNewTimeInput(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 outline-none"
              />
              <button
                type="button"
                onClick={handleAddTime}
                className="px-4 py-2 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-xl transition-colors flex items-center gap-1.5 min-h-[42px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Time</span>
              </button>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Personal Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prescribed by Dr. Henderson. Keep in cool dark cabinet."
              className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F95518] outline-none text-sm"
            />
          </div>

          {/* Prescription Document Upload */}
          <div className="p-4 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Prescription Document (Optional)
                </label>
                <p className="text-[11px] text-slate-500">
                  Upload prescription PDF or image (JPG, PNG up to 5 MB)
                </p>
              </div>

              {prescriptionFilename ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <FileCheck className="w-4 h-4" />
                  <span className="truncate max-w-[150px]">{prescriptionFilename}</span>
                  <button
                    type="button"
                    onClick={() => setPrescriptionFilename(undefined)}
                    className="text-slate-400 hover:text-red-600"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {prescriptionError && (
              <p className="mt-2 text-xs text-red-600 font-semibold">{prescriptionError}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#F95518] hover:bg-[#e0470f] text-white font-bold text-sm rounded-xl shadow-xs transition-colors min-h-[48px]"
            >
              {editingMedicine ? 'Update Medicine' : 'Save Prescribed Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
