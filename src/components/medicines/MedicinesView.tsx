import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  FileCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye
} from 'lucide-react';
import { Medicine } from '../../types';
import { StorageService } from '../../services/storageService';
import { MedicineFormModal } from './MedicineFormModal';

interface MedicinesViewProps {
  onRefresh: () => void;
}

export const MedicinesView: React.FC<MedicinesViewProps> = ({ onRefresh }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(() => StorageService.getMedicines());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refreshList = () => {
    setMedicines(StorageService.getMedicines());
    onRefresh();
  };

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    StorageService.deleteMedicine(id);
    setDeleteConfirmId(null);
    refreshList();
  };

  const handleToggleActive = (med: Medicine) => {
    const updated = { ...med, isActive: !med.isActive };
    StorageService.saveMedicine(updated);
    refreshList();
  };

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterActive === 'active') return med.isActive;
    if (filterActive === 'inactive') return !med.isActive;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
            <Pill className="w-4 h-4" />
            <span>Prescription Inventory</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3326]">
            My Prescribed Medicines
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage your medicines, dosage guidelines, reminder schedules, and prescription attachments
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3.5 bg-[#F95518] hover:bg-[#e0470f] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D8] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or dosage..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
          />
        </div>

        {/* Segmented active filters (allowed interactive buttons) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterActive('all')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              filterActive === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({medicines.length})
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              filterActive === 'active' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({medicines.filter(m => m.isActive).length})
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              filterActive === 'inactive' ? 'bg-white text-slate-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inactive ({medicines.filter(m => !m.isActive).length})
          </button>
        </div>
      </div>

      {/* Medicines Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#E8E2D8] space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Pill className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-xl font-bold text-slate-800">
            No Medicines Found
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No medicines match "${searchQuery}". Try adjusting your search query.`
              : 'You have not added any medicines to your schedule yet. Click below to add your first prescription.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-6 py-3 bg-[#1E3326] text-white font-bold text-sm rounded-xl hover:bg-[#15251C] transition-colors"
          >
            Add Your First Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMedicines.map((med) => (
            <div
              key={med.id}
              className={`bg-white p-6 rounded-3xl border transition-all shadow-xs ${
                med.isActive ? 'border-[#E8E2D8] hover:border-slate-300' : 'border-slate-200 opacity-60'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-xl font-bold text-slate-900">
                      {med.name}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-md">
                      {med.dosage}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Started {med.startDate}</span>
                    {med.endDate && (
                      <>
                        <span>·</span>
                        <span>Ends {med.endDate}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Active switch button */}
                <button
                  onClick={() => handleToggleActive(med)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                    med.isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                  title="Toggle active status"
                >
                  {med.isActive ? 'Active' : 'Paused'}
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-4 p-3.5 bg-[#FAF8F5] rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Doctor Instructions:
                </div>
                <p className="text-sm text-slate-800 font-medium mt-0.5 leading-relaxed">
                  {med.instructions}
                </p>
              </div>

              {/* Reminder Times */}
              <div className="mt-4">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span>Scheduled Daily Reminders:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {med.reminderTimes.map((time) => (
                    <span
                      key={time}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 shadow-2xs"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes & Prescription */}
              {(med.notes || med.prescriptionFilename) && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  {med.notes && (
                    <p className="text-slate-600 italic">
                      Note: {med.notes}
                    </p>
                  )}
                  {med.prescriptionFilename && (
                    <div className="flex items-center gap-1.5 text-teal-800 font-bold">
                      <FileCheck className="w-4 h-4 text-teal-700" />
                      <span>Attached: {med.prescriptionFilename}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(med)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                {deleteConfirmId === med.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-700 font-bold">Confirm delete?</span>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(med.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <MedicineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={refreshList}
        editingMedicine={editingMedicine}
      />
    </div>
  );
};
