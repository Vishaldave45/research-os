import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { useProjectStore } from '../store/projectStore';
import { useWorkspaceStore } from '../../workspaces/store/workspaceStore';
import { Loader2, AlertCircle } from 'lucide-react';
import { Project } from '../../../types/research';

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { activeWorkspace } = useWorkspaceStore();
  const { createProject, isSaving, error, clearError } = useProjectStore();

  const [name, setName] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!activeWorkspace) {
      setValidationError('Please select or create an active workspace first.');
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setValidationError('Project name must be at least 2 characters.');
      return;
    }

    try {
      const created = await createProject(activeWorkspace.id, {
        name: trimmedName,
        research_area: researchArea.trim() || undefined,
        description: description.trim() || undefined,
        status,
      });

      setName('');
      setResearchArea('');
      setDescription('');
      setStatus('active');
      onSuccess?.(created);
      onClose();
    } catch {
      // Handled in store
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create research project"
      description="Initialize a dedicated research line for questions, literature, hypotheses, and trials."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || validationError) && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <p>{error || validationError}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Project name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="e.g. WCE Model Compression"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Research area
          </label>
          <input
            type="text"
            value={researchArea}
            onChange={(e) => setResearchArea(e.target.value)}
            placeholder="e.g. Medical AI"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Depth-reduced deep learning models for wireless capsule endoscopy"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Create project</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
