import React from 'react';
import { useResearchStore } from '../../../store/useResearchStore';
import { ShieldCheck, Plus } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';

export const ProjectClaimsPage: React.FC = () => {
  const { claims, openCreateModal, resetToCanonicalDataset } = useResearchStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scientific Claims</h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded factual assertions with dynamically audited evidentiary confidence scores.
          </p>
        </div>

        <button
          onClick={() => openCreateModal('claim')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Claim</span>
        </button>
      </div>

      {claims.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No scientific claims asserted"
          description="Formulate final empirical claims once experimental trials validate your initial hypotheses."
          actionLabel="+ Add Claim"
          onAction={() => openCreateModal('claim')}
          secondaryActionLabel="Seed Canonical Dataset"
          onSecondaryAction={() => resetToCanonicalDataset()}
        />
      ) : (
        <div className="space-y-4">
          {claims.map((c) => {
            const scorePct = Math.round((c.confidenceScore ?? 1.0) * 100);
            return (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {c.code}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600">
                      <span className="text-slate-400">Confidence:</span>
                      <span className={`font-bold ${scorePct >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {scorePct}%
                      </span>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {c.statement}
                </h3>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
