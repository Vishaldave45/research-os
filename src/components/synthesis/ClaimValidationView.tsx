import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  Activity,
  Plus,
  ArrowRight,
  Gauge,
  Zap,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';

export const ClaimValidationView: React.FC = () => {
  const { claims, validateClaimAudit, selectEntity, openCreateModal } = useResearchStore();
  const [selectedClaimId, setSelectedClaimId] = useState<string>(
    claims[0]?.id || ''
  );

  const activeAudit = selectedClaimId ? validateClaimAudit(selectedClaimId) : null;

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Evidentiary Claim Auditor & Graph Grounding
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Validates scientific claims by traversing empirical results, metrics, and literature citations across the research operating graph.
            </p>
          </div>

          <button
            onClick={() => openCreateModal('claim')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Claim</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Split claims selector and audit inspector */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Claims List */}
        <div className="w-88 border-r border-slate-200 bg-white overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Auditable Claims ({claims.length})
          </div>

          {claims.map((claim) => {
            const isSelected = claim.id === selectedClaimId;
            return (
              <div
                key={claim.id}
                onClick={() => setSelectedClaimId(claim.id)}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-900">
                    {claim.code}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {Math.round(claim.confidenceScore * 100)}% Confidence
                  </span>
                </div>
                <h4 className="mt-1.5 text-xs font-bold text-slate-900 line-clamp-2">
                  {claim.title || claim.statement}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="capitalize">{claim.status}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Inspect Audit →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Detailed Evidentiary Audit */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeAudit ? (
            <div className="space-y-6 max-w-4xl">
              {/* Score & Verdict Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-800">
                      {activeAudit.claimCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {activeAudit.claimStatement}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Evidentiary Grounding
                      </div>
                      <div className="font-mono text-2xl font-black text-emerald-600">
                        {Math.round(activeAudit.evidentiaryScore * 100)}%
                      </div>
                    </div>
                    <div
                      className={`rounded-xl border px-3 py-2 text-xs font-bold capitalize ${
                        activeAudit.supportLevel === 'strongly_supported'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : activeAudit.supportLevel === 'contradicted'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {activeAudit.supportLevel.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs leading-relaxed text-slate-700">
                  <strong>Graph Audit Critique:</strong> {activeAudit.validationCritique}
                </div>
              </div>

              {/* Supporting Empirical Results */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Supporting Empirical Results ({activeAudit.supportingResults.length})
                  </h4>
                </div>

                {activeAudit.supportingResults.length === 0 ? (
                  <p className="text-xs italic text-slate-400">
                    No empirical results currently linked to support this claim.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeAudit.supportingResults.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => selectEntity(res.id, 'result')}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50/50 p-4 hover:border-emerald-400 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-cyan-900">
                            {res.code}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            Supports Claim ✓
                          </span>
                        </div>
                        <h5 className="mt-1 text-xs font-bold text-slate-900">
                          {res.title}
                        </h5>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          {res.summary}
                        </p>

                        {res.metrics && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(res.metrics).map(([k, v]) => (
                              <span
                                key={k}
                                className="rounded bg-white px-2 py-1 font-mono text-[10px] font-semibold text-slate-800 border border-slate-200 shadow-2xs"
                              >
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contradicting or Boundary Tests */}
              {activeAudit.contradictingResults.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                      Contradicting Results & Boundary Violations ({activeAudit.contradictingResults.length})
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {activeAudit.contradictingResults.map((res) => (
                      <div
                        key={res.id}
                        className="rounded-lg border border-rose-200 bg-white p-4"
                      >
                        <span className="font-mono text-xs font-bold text-rose-900">
                          {res.code}
                        </span>
                        <h5 className="mt-1 text-xs font-bold text-slate-900">
                          {res.title}
                        </h5>
                        <p className="mt-1 text-xs text-slate-600">
                          {res.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citing Publications */}
              {activeAudit.citingPapers.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Corroborating Literature Citations ({activeAudit.citingPapers.length})
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {activeAudit.citingPapers.map((paper) => (
                      <div
                        key={paper.id}
                        onClick={() => selectEntity(paper.id, 'paper')}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-blue-400 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-800">
                            {paper.code}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">
                            {paper.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 italic">
                          {paper.venue} ({paper.year})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              Select a claim to view evidentiary audit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
