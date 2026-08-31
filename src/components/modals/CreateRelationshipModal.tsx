import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Link2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { RelationType } from '../../types/research';
import {
  getAllowedRelations,
  isRelationSemanticallyAllowed,
  wouldCreateCycle,
} from '../../utils/relationshipRules';

export const CreateRelationshipModal: React.FC = () => {
  const {
    isLinkModalOpen,
    linkModalSourceId,
    closeLinkModal,
    getAllEntities,
    addRelationship,
    getEntityById,
    relationships,
  } = useResearchStore();

  const allEntities = getAllEntities();

  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [relationType, setRelationType] = useState<RelationType>('informs');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isLinkModalOpen) {
      setErrorMessage(null);
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

  const sourceEntity = getEntityById(sourceId);
  const targetEntity = getEntityById(targetId);

  // Determine allowed relations for the selected source & target
  const allowedRelations = useMemo(() => {
    if (!sourceEntity || !targetEntity) return ['informs'] as RelationType[];
    const list = getAllowedRelations(sourceEntity.type, targetEntity.type);
    return list.length > 0 ? list : (['informs', 'supports', 'motivates'] as RelationType[]);
  }, [sourceEntity, targetEntity]);

  // Adjust selected relationType when source/target changes if not in allowed list
  React.useEffect(() => {
    if (allowedRelations.length > 0 && !allowedRelations.includes(relationType)) {
      setRelationType(allowedRelations[0]);
    }
  }, [allowedRelations]);

  // Cycle check
  const isCycle = useMemo(() => {
    if (!sourceId || !targetId || sourceId === targetId) return false;
    return wouldCreateCycle(relationships, sourceId, targetId);
  }, [relationships, sourceId, targetId]);

  if (!isLinkModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!sourceId || !targetId || sourceId === targetId || !sourceEntity || !targetEntity) {
      setErrorMessage('Please select both a valid source and target node.');
      return;
    }

    if (isCycle) {
      setErrorMessage('Creating this link introduces a directed cycle in the evidence flow.');
      return;
    }

    try {
      await addRelationship({
        sourceId,
        sourceType: sourceEntity.type,
        targetId,
        targetType: targetEntity.type,
        relationType,
      });
      closeLinkModal();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create relationship link.');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={closeLinkModal}
        className="fixed inset-0 z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 my-auto w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shadow-2xs">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Connect Research Reasoning Nodes
              </h3>
              <p className="text-[11px] text-slate-500">
                Enforce scientific relationship ontology & DAG integrity
              </p>
            </div>
          </div>
          <button
            onClick={closeLinkModal}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Source Node */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Node (Antecedent)
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden bg-white"
            >
              {allEntities.map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.code}] ({e.type.toUpperCase()}) {e.title.slice(0, 60)}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Semantics */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Directed Relationship Semantics
              </label>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                Domain-validated
              </span>
            </div>
            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value as RelationType)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden bg-white font-mono"
            >
              {allowedRelations.map((rel) => (
                <option key={rel} value={rel}>
                  -- {rel.toUpperCase().replace('_', ' ')} --
                </option>
              ))}
            </select>
          </div>

          {/* Target Node */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Node (Consequent)
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden bg-white"
            >
              {allEntities
                .filter((e) => e.id !== sourceId)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    [{e.code}] ({e.type.toUpperCase()}) {e.title.slice(0, 60)}
                  </option>
                ))}
            </select>
          </div>

          {/* Cycle detection warning */}
          {isCycle && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <strong>Warning:</strong> Adding this link creates a cyclic loop back to an antecedent node.
              </span>
            </div>
          )}

          {/* Relationship Preview */}
          {sourceEntity && targetEntity && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
              <div className="flex flex-col">
                <span className="font-mono font-bold text-slate-800">
                  {sourceEntity.code}
                </span>
                <span className="text-[10px] text-slate-500 capitalize">
                  {sourceEntity.type}
                </span>
              </div>
              <span className="font-semibold text-indigo-600 uppercase text-[10px] px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200">
                {relationType.replace('_', ' ')} →
              </span>
              <div className="flex flex-col items-end">
                <span className="font-mono font-bold text-slate-800">
                  {targetEntity.code}
                </span>
                <span className="text-[10px] text-slate-500 capitalize">
                  {targetEntity.type}
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeLinkModal}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCycle}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition cursor-pointer"
            >
              Create Edge Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

