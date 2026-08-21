import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useAuthStore } from '../../auth/store/authStore';
import { Users, UserPlus, Shield, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { StatusBadge } from '../../../shared/components/StatusBadge';

export const WorkspaceMembersPage: React.FC = () => {
  const { activeWorkspace, members, fetchMembers, addMember, isSaving, error, clearError } = useWorkspaceStore();
  const { user: currentUser } = useAuthStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'researcher' | 'viewer'>('researcher');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (activeWorkspace) {
      fetchMembers(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    const trimmed = inviteEmail.trim();
    if (!trimmed) {
      setValidationError('Colleague email is required.');
      return;
    }

    try {
      await addMember(trimmed, inviteRole);
      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch {
      // Handled in store
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage researchers and collaborators who have access to this workspace.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members List */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {/* Current User Row */}
          {currentUser && (
            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-xs text-indigo-700">
                  {currentUser.full_name?.charAt(0) || currentUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {currentUser.full_name || 'You'}
                    </span>
                    <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                      You
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{currentUser.email}</span>
                </div>
              </div>
              <StatusBadge status="Owner" />
            </div>
          )}

          {/* Invited Members */}
          {members
            .filter((m) => m.userId !== currentUser?.id)
            .map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-semibold text-xs text-slate-600">
                    {member.fullName?.charAt(0) || member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {member.fullName || member.email.split('@')[0]}
                    </h4>
                    <span className="text-xs text-slate-400">{member.email}</span>
                  </div>
                </div>
                <StatusBadge status={member.role} />
              </div>
            ))}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite member to workspace"
        description="Invited collaborators will be able to view and contribute to research projects."
        maxWidth="sm"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          {(error || validationError) && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <p>{error || validationError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Colleague Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="collaborator@institute.org"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
            >
              <option value="researcher">Researcher (Can create and edit projects)</option>
              <option value="admin">Admin (Can manage workspace settings)</option>
              <option value="viewer">Viewer (Read-only access)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              disabled={isSaving}
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Send Invitation</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
