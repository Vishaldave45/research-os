import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useResearchStore } from '../../../store/useResearchStore';
import { DOMAIN_TEMPLATES, DomainTemplate } from '../../../data/domainTemplates';
import {
  Loader2,
  AlertCircle,
  BrainCircuit,
  MessageSquareText,
  Bot,
  Dna,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';

export interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createWorkspace, isSaving, error, clearError } = useWorkspaceStore();
  const { loadDomainTemplate } = useResearchStore();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('wce-vision-ai');
  const [name, setName] = useState('DepthReduce Lab');
  const [description, setDescription] = useState(
    'Wireless capsule endoscopy model compression, layer folding, and thermal limits'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelectTemplate = (template: DomainTemplate | null) => {
    if (!template) {
      setSelectedTemplateId('custom');
      setName('');
      setDescription('');
    } else {
      setSelectedTemplateId(template.id);
      setName(template.dataset.workspace?.name || template.name);
      setDescription(template.dataset.workspace?.description || template.description);
    }
    setValidationError(null);
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'BrainCircuit':
        return <BrainCircuit className="h-4 w-4 text-indigo-600" />;
      case 'MessageSquareText':
        return <MessageSquareText className="h-4 w-4 text-emerald-600" />;
      case 'Bot':
        return <Bot className="h-4 w-4 text-amber-600" />;
      case 'Dna':
        return <Dna className="h-4 w-4 text-rose-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-indigo-600" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setValidationError('Workspace name must be at least 2 characters.');
      return;
    }

    try {
      await createWorkspace(trimmedName, description.trim() || undefined);

      // If a domain template was selected, seed its canonical research graph
      const chosenTemplate = DOMAIN_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (chosenTemplate) {
        await loadDomainTemplate(chosenTemplate);
      }

      setName('');
      setDescription('');
      onSuccess?.();
      onClose();
    } catch {
      // Handled in store
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Research Workspace"
      description="Initialize a dedicated multi-domain laboratory workspace or start from a scientific research template."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || validationError) && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <p>{error || validationError}</p>
          </div>
        )}

        {/* Domain Template Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Research Domain Template
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DOMAIN_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`relative flex flex-col justify-between p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                          {getTemplateIcon(tmpl.icon)}
                        </div>
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {tmpl.domainName}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Custom Blank Workspace Option */}
            <div
              onClick={() => handleSelectTemplate(null)}
              className={`relative flex flex-col justify-between p-3 rounded-xl border transition-all cursor-pointer text-left ${
                selectedTemplateId === 'custom'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-2xs">
                      <Layers className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      Custom Blank Workspace
                    </span>
                  </div>
                  {selectedTemplateId === 'custom' && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Start with a clean slate for custom multidisciplinary research.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Fields */}
        <div className="pt-1 border-t border-slate-100 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Workspace Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. DistilReason Lab"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Laboratory Scope & Research Objectives
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Parameter-efficient reasoning distillation and KV-cache compression for edge LLMs"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
            />
          </div>
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
            <span>Initialize Workspace</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
