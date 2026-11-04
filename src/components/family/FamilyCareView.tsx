import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Heart,
  Eye,
  Lock,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { CaregiverConnection } from '../../types';
import { StorageService } from '../../services/storageService';

export const FamilyCareView: React.FC = () => {
  const [connections, setConnections] = useState<CaregiverConnection[]>(() =>
    StorageService.getCaregiverConnections()
  );
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Daughter');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setConnections(StorageService.getCaregiverConnections());
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !email.trim()) {
      setFormError('Please provide both name and email.');
      return;
    }

    const patient = StorageService.getCurrentUser();
    const newConn: CaregiverConnection = {
      id: `conn-${Date.now()}`,
      patientId: patient.id,
      caregiverEmail: email.trim().toLowerCase(),
      caregiverName: name.trim(),
      relationship: relationship.trim(),
      status: 'invited',
      message: message.trim() || undefined,
      canViewMedicines: true,
      canViewLogs: true,
      canReceiveAlerts: true,
      createdAt: new Date().toISOString()
    };

    StorageService.saveCaregiverConnection(newConn);
    setName('');
    setEmail('');
    setMessage('');
    setShowInviteModal(false);
    refreshList();
  };

  const handleUpdateStatus = (id: string, status: CaregiverConnection['status']) => {
    StorageService.updateConnectionStatus(id, status);
    refreshList();
  };

  const handleRemove = (id: string) => {
    StorageService.removeCaregiverConnection(id);
    refreshList();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-widest mb-1">
            <Users className="w-4 h-4" />
            <span>Family & Caregiver Circle</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E3326]">
            Patient-Controlled Family Care
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Stay connected with loved ones without sacrificing your privacy or independence
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-5 py-3.5 bg-[#F95518] hover:bg-[#e0470f] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap min-h-[48px]"
        >
          <UserPlus className="w-5 h-5" />
          <span>Invite Family Member</span>
        </button>
      </div>

      {/* Patient Sovereignty Notice */}
      <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8] flex items-start gap-3.5 text-xs text-slate-700">
        <ShieldCheck className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block text-sm">
            You Maintain Complete Control Over Your Health Records
          </span>
          <p className="leading-relaxed">
            Only you can grant or stop sharing. Caregivers can see whether you confirmed your medicines, but they <strong>cannot alter, edit, or delete your prescriptions</strong>.
          </p>
        </div>
      </div>

      {/* Connected Members Grid */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-[#1E3326]">
          Connected Caregivers & Loved Ones
        </h2>

        {connections.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-3xl border border-[#E8E2D8] space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-heading text-lg font-bold text-slate-800">
              No Family Members Connected Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You can invite your daughter, son, or trusted caregiver to receive peace-of-mind confirmation updates.
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-5 py-2.5 bg-[#1E3326] text-white text-xs font-bold rounded-xl"
            >
              Invite First Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {connections.map((conn) => {
              const isGranted = conn.status === 'granted';
              const isInvited = conn.status === 'invited';
              const isAccepted = conn.status === 'accepted';
              const isRevoked = conn.status === 'revoked';

              return (
                <div
                  key={conn.id}
                  className="bg-white p-6 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-lg border border-teal-100">
                        {conn.caregiverName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-bold text-slate-900">
                          {conn.caregiverName}
                        </h3>
                        <div className="text-xs text-slate-500 font-medium">
                          {conn.relationship} · {conn.caregiverEmail}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isGranted && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-lg inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Sharing Active</span>
                        </span>
                      )}
                      {isInvited && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-lg inline-flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-amber-700" />
                          <span>Invitation Sent</span>
                        </span>
                      )}
                      {isAccepted && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-lg inline-flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-blue-700" />
                          <span>Accepted (Needs Grant)</span>
                        </span>
                      )}
                      {isRevoked && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg inline-flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Sharing Revoked</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {conn.message && (
                    <p className="text-xs text-slate-600 bg-[#FAF8F5] p-3 rounded-xl border border-slate-200 italic">
                      "{conn.message}"
                    </p>
                  )}

                  {/* Permissions Checklist */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${isGranted ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span>View Medicines</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${isGranted ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span>View Doses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${isGranted ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span>Emergency Alerts</span>
                    </div>
                  </div>

                  {/* Actions & Workflow Controls */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isInvited && (
                        <button
                          onClick={() => handleUpdateStatus(conn.id, 'accepted')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                          title="Simulate recipient accepting invitation"
                        >
                          Simulate Accept
                        </button>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => handleUpdateStatus(conn.id, 'granted')}
                          className="px-3 py-1.5 bg-[#1E3326] text-white text-xs font-bold rounded-lg hover:bg-[#15251C] transition-colors"
                        >
                          Grant Access Now
                        </button>
                      )}

                      {isGranted && (
                        <button
                          onClick={() => handleUpdateStatus(conn.id, 'revoked')}
                          className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          Stop Sharing
                        </button>
                      )}

                      {isRevoked && (
                        <button
                          onClick={() => handleUpdateStatus(conn.id, 'granted')}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          Restore Sharing
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemove(conn.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove member link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-slate-900">
                Invite Family Member or Caregiver
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            {formError && (
              <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
                {formError}
              </p>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Vance"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah.vance@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Relationship *
                </label>
                <input
                  type="text"
                  required
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Daughter, Son, Home Nurse, Spouse"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Hi Sarah, here is an invite to help keep an eye on my daily medicine schedule."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F95518]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#F95518] hover:bg-[#e0470f] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
