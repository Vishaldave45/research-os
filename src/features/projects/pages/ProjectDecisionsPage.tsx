import React from 'react';
import { useResearchStore } from '../../../store/useResearchStore';
import { GitBranch, Plus, ArrowRight, Network } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';

export interface ProjectDecisionsPageProps {
  onTraceDecision: (decisionId: string) => void;
}

export const ProjectDecisionsPage: React.FC<ProjectDecisionsPageProps> = ({
  onTraceDecision,
}) => {
  const { decisions, openCreateModal, resetToCanonicalDataset } = useResearchStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Decisions & Resolutions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Evidence-backed engineering verdicts, architecture pivots, and protocol approvals.
          </p>
        </div>

        <button
          onClick={() => openCreateModal('decision')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Decision</span>
        </button>
      </div>

      {decisions.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No decisions recorded"
          description="Document critical architecture changes or research resolutions grounded in observed empirical results."
          actionLabel="+ Add Decision"
          onAction={() => openCreateModal('decision')}
          secondaryActionLabel="Seed Canonical Dataset"
          onSecondaryAction={() => resetToCanonicalDataset()}
        />
      ) : (
        <div className="space-y-4">
          {decisions.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                  {d.code}
                </span>
                <div className="flex items-center gap-3">
                  <StatusBadge status={d.outcome} />
                  <button
                    onClick={() => onTraceDecision(d.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                  >
                    <Network className="h-3.5 w-3.5" />
                    <span>Trace Evidence</span>
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {d.title}
              </h3>

              <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Evidence Rationale
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {d.rationale}
                </p>
              </div>

              {d.implications && (
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-700">Implications:</strong> {d.implications}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
