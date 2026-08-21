import React from 'react';
import { useResearchStore } from '../../../store/useResearchStore';
import { Lightbulb, Plus } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';

export const ProjectHypothesesPage: React.FC = () => {
  const { hypotheses, openCreateModal, resetToCanonicalDataset } = useResearchStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hypotheses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Testable, falsifiable propositions formulated to resolve identified gaps.
          </p>
        </div>

        <button
          onClick={() => openCreateModal('hypothesis')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Hypothesis</span>
        </button>
      </div>

      {hypotheses.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No hypotheses formulated"
          description="State specific conjectures and anticipated empirical outcomes to be validated through benchmark trials."
          actionLabel="+ Add Hypothesis"
          onAction={() => openCreateModal('hypothesis')}
          secondaryActionLabel="Seed Canonical Dataset"
          onSecondaryAction={() => resetToCanonicalDataset()}
        />
      ) : (
        <div className="space-y-4">
          {hypotheses.map((h) => (
            <div
              key={h.id}
              className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                  {h.code}
                </span>
                <div className="flex items-center gap-3">
                  {h.confidence !== undefined && (
                    <span className="text-xs font-mono font-medium text-slate-500">
                      Confidence: {(h.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                  <StatusBadge status={h.status} />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {h.statement}
              </h3>

              {h.rationale && (
                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Scientific Rationale
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {h.rationale}
                  </p>
                </div>
              )}

              {h.expectedOutcome && (
                <div className="text-xs text-slate-600">
                  <strong>Expected Outcome:</strong> {h.expectedOutcome}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
