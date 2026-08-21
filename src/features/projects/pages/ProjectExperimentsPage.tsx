import React from 'react';
import { useResearchStore } from '../../../store/useResearchStore';
import { FlaskConical, Plus } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';

export const ProjectExperimentsPage: React.FC = () => {
  const { experiments, openCreateModal, resetToCanonicalDataset } = useResearchStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Experiments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Controlled empirical validation trials and benchmark execution runs.
          </p>
        </div>

        <button
          onClick={() => openCreateModal('experiment')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Experiment</span>
        </button>
      </div>

      {experiments.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No experiments planned or executed"
          description="Design trial protocols, ablation studies, and evaluation runs to test your active hypotheses."
          actionLabel="+ Add Experiment"
          onAction={() => openCreateModal('experiment')}
          secondaryActionLabel="Seed Canonical Dataset"
          onSecondaryAction={() => resetToCanonicalDataset()}
        />
      ) : (
        <div className="space-y-4">
          {experiments.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                  {e.code}
                </span>
                <StatusBadge status={e.status} />
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {e.title}
              </h3>

              {e.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {e.description}
                </p>
              )}

              {((e.parameters && Object.keys(e.parameters).length > 0) || (e.config && Object.keys(e.config).length > 0) || (e.metadata && Object.keys(e.metadata).length > 0)) && (
                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Configuration & Parameters
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries({ ...(e.metadata || {}), ...(e.config || {}), ...(e.parameters || {}) }).map(([key, val]) => (
                      <div key={key} className="bg-white p-2 rounded border border-slate-200/60 font-mono text-[11px]">
                        <span className="text-slate-400 block text-[10px] uppercase">{key}</span>
                        <span className="text-slate-900 font-semibold">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
