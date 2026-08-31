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
      <div className="border-b border-slate-200/90 bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 shadow-2xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">
                Evidentiary Claim Auditor & Graph Grounding
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Validates scientific claims by traversing empirical results, metrics, and literature citations across the research graph.
            </p>
          </div>

          <button
            onClick={() => openCreateModal('claim')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Claim</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Split claims selector and audit inspector */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Claims List */}
        <div className="w-80 lg:w-96 border-r border-slate-200/90 bg-white/80 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Auditable Claims ({claims.length})
            </span>
          </div>

          {claims.map((claim) => {
            const isSelected = claim.id === selectedClaimId;
            return (
              <div
                key={claim.id}
                onClick={() => setSelectedClaimId(claim.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-100'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100/70 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                    {claim.code}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {Math.round(claim.confidenceScore * 100)}% Confidence
                  </span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {claim.title || claim.statement}
                </h4>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100/80 pt-2">
                  <span className="capitalize font-medium text-slate-600">{claim.status}</span>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    Audit Report <ArrowRight className="h-3 w-3" />
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
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="max-w-xl">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                      {activeAudit.claimCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                      {activeAudit.claimStatement}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Grounding Score
                      </div>
                      <div className="font-mono text-3xl font-black text-emerald-600 tracking-tight">
                        {Math.round(activeAudit.evidentiaryScore * 100)}%
                      </div>
                    </div>
                    <div
                      className={`rounded-2xl border px-3.5 py-2 text-xs font-bold capitalize shadow-2xs ${
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

                <div className="mt-4 text-xs leading-relaxed text-slate-700 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
                  <strong className="text-slate-900">Evidentiary Audit Critique:</strong> {activeAudit.validationCritique}
                </div>
              </div>

              {/* Supporting Empirical Results */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
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
                  <div className="space-y-3.5">
                    {activeAudit.supportingResults.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => selectEntity(res.id, 'result')}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/50 p-4.5 hover:border-emerald-400 hover:shadow-2xs transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-cyan-900 bg-cyan-50 border border-cyan-200/60 px-2 py-0.5 rounded-md">
                            {res.code}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            Verified Result ✓
                          </span>
                        </div>
                        <h5 className="mt-2 text-xs font-bold text-slate-900">
                          {res.title}
                        </h5>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          {res.summary}
                        </p>

                        {res.metrics && (
                          <div className="mt-3.5 flex flex-wrap gap-2">
                            {Object.entries(res.metrics).map(([k, v]) => (
                              <span
                                key={k}
                                className="rounded-lg bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-slate-800 border border-slate-200 shadow-2xs"
                              >
                                <span className="text-slate-400 uppercase mr-1">{k}:</span>
                                {String(v)}
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
                <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-6 shadow-xs">
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
                        className="rounded-xl border border-rose-200 bg-white p-4 shadow-2xs"
                      >
                        <span className="font-mono text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          {res.code}
                        </span>
                        <h5 className="mt-2 text-xs font-bold text-slate-900">
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
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Corroborating Literature Citations ({activeAudit.citingPapers.length})
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    {activeAudit.citingPapers.map((paper) => (
                      <div
                        key={paper.id}
                        onClick={() => selectEntity(paper.id, 'paper')}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
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
