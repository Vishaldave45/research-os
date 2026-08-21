import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../../features/workspaces/store/workspaceStore';
import { useAuthStore } from '../../features/auth/store/authStore';
import { Modal } from '../../shared/components/Modal';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Users, UserPlus, Mail, Loader2, AlertCircle } from 'lucide-react';

export interface WorkspaceMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeWorkspace, members, fetchMembers, addMember, isSaving, error, clearError } = useWorkspaceStore();
  const { user: currentUser } = useAuthStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'researcher' | 'viewer'>('researcher');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeWorkspace) {
      fetchMembers(activeWorkspace.id);
    }
  }, [isOpen, activeWorkspace, fetchMembers]);

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
    } catch {
      // Handled in store
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${activeWorkspace?.name || 'Workspace'} Members`}
      description="Manage researchers and collaborators who have access to this workspace."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Invite Form */}
        <form onSubmit={handleInvite} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Invite New Collaborator
          </div>

          {(error || validationError) && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <p>{error || validationError}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="colleague@institute.org"
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            >
              <option value="researcher">Researcher</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              <span>Invite</span>
            </button>
          </div>
        </form>

        {/* Current Members List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {currentUser && (
              <div className="flex items-center justify-between p-3.5 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-xs text-indigo-700">
                    {currentUser.full_name?.charAt(0) || currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {currentUser.full_name || 'You'}
                      </span>
                      <span className="rounded bg-indigo-50 px-1 py-0.2 text-[9px] font-semibold text-indigo-700">
                        You
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{currentUser.email}</span>
                  </div>
                </div>
                <StatusBadge status="Owner" size="sm" />
              </div>
            )}

            {members
              .filter((m) => m.userId !== currentUser?.id)
              .map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-semibold text-xs text-slate-600">
                      {member.fullName?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">
                        {member.fullName || member.email.split('@')[0]}
                      </h4>
                      <span className="text-[11px] text-slate-400">{member.email}</span>
                    </div>
                  </div>
                  <StatusBadge status={member.role} size="sm" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
