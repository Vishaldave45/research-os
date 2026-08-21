import React from 'react';
import { useResearchStore } from '../../../store/useResearchStore';
import { AlertCircle, Plus } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';

export const ProjectGapsPage: React.FC = () => {
  const { gaps, openCreateModal, resetToCanonicalDataset } = useResearchStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research Gaps</h1>
          <p className="text-xs text-slate-500 mt-1">
            Unaddressed limitations, methodological bottlenecks, and benchmark blindspots in existing literature.
          </p>
        </div>

        <button
          onClick={() => openCreateModal('gap')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Gap</span>
        </button>
      </div>

      {gaps.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No research gaps identified"
          description="Document critical shortcomings in existing methods that motivate your hypotheses."
          actionLabel="+ Add Gap"
          onAction={() => openCreateModal('gap')}
          secondaryActionLabel="Seed Canonical Dataset"
          onSecondaryAction={() => resetToCanonicalDataset()}
        />
      ) : (
        <div className="space-y-4">
          {gaps.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  {g.code}
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={g.impactLevel} />
                  <StatusBadge status={g.status} />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {g.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {g.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
