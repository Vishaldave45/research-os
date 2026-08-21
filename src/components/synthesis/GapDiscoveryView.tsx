import React, { useState } from 'react';
import {
  AlertCircle,
  Sparkles,
  Lightbulb,
  Plus,
  ArrowRight,
  Flame,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { DiscoveredGapProposal, GapEntity, HypothesisEntity } from '../../types/research';

export const GapDiscoveryView: React.FC = () => {
  const {
    gaps,
    getDiscoveredGaps,
    addEntity,
    addRelationship,
    selectEntity,
    setViewMode,
    openCreateModal,
  } = useResearchStore();

  const discoveredProposals = getDiscoveredGaps();
  const [adoptedGaps, setAdoptedGaps] = useState<string[]>([]);

  const handleAdoptProposal = (proposal: DiscoveredGapProposal) => {
    // Create new Gap Entity
    const gapId = `g-${Date.now()}`;
    const nextGapCode = `G-00${gaps.length + 1}`;

    const newGap: GapEntity = {
      id: gapId,
      code: nextGapCode,
      type: 'gap',
      title: proposal.title,
      description: proposal.description,
      impactLevel: proposal.impactLevel,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    // Create proposed Hypothesis
    const hypId = `h-${Date.now()}`;
    const nextHypCode = `H-00${Date.now().toString().slice(-2)}`;
    const newHyp: HypothesisEntity = {
      id: hypId,
      code: nextHypCode,
      type: 'hypothesis',
      title: proposal.title,
      statement: proposal.proposedHypothesis,
      rationale: `Derived from newly identified literature gap ${nextGapCode}.`,
      expectedOutcome: proposal.recommendedExperimentProtocol,
      status: 'draft',
      confidence: 0.75,
      createdAt: new Date().toISOString(),
    };

    addEntity(newGap);
    addEntity(newHyp);

    // Link Gap motivates Hypothesis
    addRelationship({
      sourceId: gapId,
      sourceType: 'gap',
      targetId: hypId,
      targetType: 'hypothesis',
      relationType: 'motivates',
    });

    setAdoptedGaps([...adoptedGaps, proposal.title]);
    selectEntity(hypId, 'hypothesis');
    setViewMode('canvas');
  };

  const impactStyles = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <AlertCircle className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                AI Gap Discovery & Hypothesis Generator
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Surfaces high-leverage research blindspots by analyzing contradictions, thermal limits, and quantization degradation across your literature corpus.
            </p>
          </div>

          <button
            onClick={() => openCreateModal('gap')}
            className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Custom Gap</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Existing Gaps in Workspace */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Workspace Gaps ({gaps.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap) => (
              <div
                key={gap.id}
                onClick={() => selectEntity(gap.id, 'gap')}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-900">
                      {gap.code}
                    </span>
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 uppercase">
                      Gap
                    </span>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      impactStyles[gap.impactLevel]
                    }`}
                  >
                    {gap.impactLevel} Impact
                  </span>
                </div>

                <h4 className="mt-2.5 text-xs font-bold text-slate-900">
                  {gap.title}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  {gap.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Discovered Unexplored Opportunities */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              AI Discovered Frontiers & Proposed Hypotheses
            </h3>
          </div>

          <div className="space-y-4">
            {discoveredProposals.map((proposal, idx) => {
              const isAdopted = adoptedGaps.includes(proposal.title);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/50 via-white to-white p-5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-600 text-white text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {proposal.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                          impactStyles[proposal.impactLevel]
                        }`}
                      >
                        {proposal.impactLevel} Opportunity
                      </span>
                      <div className="flex gap-1">
                        {proposal.motivatingPaperCodes.map((c) => (
                          <span
                            key={c}
                            className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-700 border border-blue-200"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-slate-700">
                    {proposal.description}
                  </p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-amber-100 bg-white/80 p-3">
                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800 uppercase">
                        <Lightbulb className="h-3.5 w-3.5 text-teal-600" />
                        Generated Hypothesis
                      </span>
                      <p className="mt-1 text-xs text-slate-800 leading-snug">
                        {proposal.proposedHypothesis}
                      </p>
                    </div>

                    <div>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-800 uppercase">
                        <FlaskConical className="h-3.5 w-3.5 text-rose-600" />
                        Recommended Protocol
                      </span>
                      <p className="mt-1 text-xs text-slate-800 leading-snug">
                        {proposal.recommendedExperimentProtocol}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleAdoptProposal(proposal)}
                      disabled={isAdopted}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                        isAdopted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-600 text-white hover:bg-amber-700 shadow-xs cursor-pointer'
                      }`}
                    >
                      {isAdopted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                          <span>Adopted to Graph Canvas</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Adopt as Gap & Hypothesis Node</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
