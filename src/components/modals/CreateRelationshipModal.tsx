import React, { useState } from 'react';
import { X, Link2, ArrowRight } from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { RelationType } from '../../types/research';

export const CreateRelationshipModal: React.FC = () => {
  const {
    isLinkModalOpen,
    linkModalSourceId,
    closeLinkModal,
    getAllEntities,
    addRelationship,
    getEntityById,
  } = useResearchStore();

  const allEntities = getAllEntities();

  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [relationType, setRelationType] = useState<RelationType>('informs');

  React.useEffect(() => {
    if (isLinkModalOpen) {
      if (linkModalSourceId) {
        setSourceId(linkModalSourceId);
        const availableTargets = allEntities.filter((e) => e.id !== linkModalSourceId);
        setTargetId(availableTargets[0]?.id || '');
      } else {
        setSourceId(allEntities[0]?.id || '');
        setTargetId(allEntities[1]?.id || '');
      }
    }
  }, [isLinkModalOpen, linkModalSourceId]);

  if (!isLinkModalOpen) return null;

  const sourceEntity = getEntityById(sourceId);
  const targetEntity = getEntityById(targetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId || !sourceEntity || !targetEntity) return;

    addRelationship({
      sourceId,
      sourceType: sourceEntity.type,
      targetId,
      targetType: targetEntity.type,
      relationType,
    });

    closeLinkModal();
  };

  const relationOptions: Array<{ type: RelationType; label: string; desc: string }> = [
    { type: 'cites', label: 'cites', desc: 'Paper provides context or citations' },
    { type: 'informs', label: 'informs', desc: 'Provides theoretical or empirical background' },
    { type: 'motivates', label: 'motivates', desc: 'Gap/Problem directly prompts hypothesis' },
    { type: 'addresses', label: 'addresses', desc: 'Hypothesis/Method answers core question' },
    { type: 'tests', label: 'tests', desc: 'Experiment executes validation of hypothesis' },
    { type: 'supports', label: 'supports', desc: 'Result provides backing evidence for claim/hypothesis' },
    { type: 'refutes', label: 'refutes', desc: 'Result contradicts hypothesis or boundary conditions' },
    { type: 'derived_from', label: 'derived from', desc: 'Claim or conclusion generated from antecedent' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Link2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Connect Research Nodes
            </h3>
          </div>
          <button
            onClick={closeLinkModal}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Source Node */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Node (From)
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              {allEntities.map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.code}] ({e.type}) {e.title.slice(0, 60)}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Semantics */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Directed Relationship Semantics
            </label>
            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value as RelationType)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              {relationOptions.map((opt) => (
                <option key={opt.type} value={opt.type}>
                  -- {opt.label} -- ({opt.desc})
                </option>
              ))}
            </select>
          </div>

          {/* Target Node */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Node (To)
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              {allEntities
                .filter((e) => e.id !== sourceId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    [{e.code}] ({e.type}) {e.title.slice(0, 60)}
                  </option>
                ))}
            </select>
          </div>

          {/* Relationship Preview */}
          {sourceEntity && targetEntity && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs">
              <span className="font-mono font-bold text-slate-800">
                {sourceEntity.code}
              </span>
              <span className="font-semibold text-indigo-600 uppercase text-[10px] px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                {relationType.replace('_', ' ')} →
              </span>
              <span className="font-mono font-bold text-slate-800">
                {targetEntity.code}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeLinkModal}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              Create Edge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
