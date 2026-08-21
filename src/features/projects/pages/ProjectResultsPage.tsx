import React from 'react';
import { useResearchStore } from '../../../store/useResearchStore';
import { BarChart3, Plus } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';

export const ProjectResultsPage: React.FC = () => {
  const { results, openCreateModal, resetToCanonicalDataset } = useResearchStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empirical Results</h1>
          <p className="text-xs text-slate-500 mt-1">
            Observed measurements, quantitative benchmarks, and output metrics from executed trials.
          </p>
        </div>

        <button
          onClick={() => openCreateModal('result')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Result</span>
        </button>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No empirical results recorded"
          description="Record output metrics, latency figures, and benchmark scores once experiment runs conclude."
          actionLabel="+ Add Result"
          onAction={() => openCreateModal('result')}
          secondaryActionLabel="Seed Canonical Dataset"
          onSecondaryAction={() => resetToCanonicalDataset()}
        />
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200/60">
                  {r.code}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {r.title}
              </h3>

              {r.summary && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {r.summary}
                </p>
              )}

              {r.metrics && Object.keys(r.metrics).length > 0 && (
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Observed Metric Values
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(r.metrics).map(([metricKey, metricVal]) => (
                      <div key={metricKey} className="rounded-lg bg-white p-2.5 border border-slate-200/70 shadow-2xs">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 truncate">
                          {metricKey}
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          {typeof metricVal === 'number' ? metricVal.toLocaleString() : String(metricVal)}
                        </div>
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
