import React, { useState } from 'react';
import { useResearchStore } from '../../../store/useResearchStore';
import { Network, GitBranch, ArrowRight, ShieldCheck, HelpCircle, BookOpen, AlertCircle, Lightbulb, FlaskConical, BarChart3 } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';

export const ProjectTraceabilityPage: React.FC = () => {
  const { decisions, claims, questions, papers, gaps, hypotheses, experiments, results, relationships } = useResearchStore();
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    decisions.length > 0 ? decisions[0].id : claims.length > 0 ? claims[0].id : ''
  );

  const allTargets = [
    ...decisions.map((d) => ({ id: d.id, code: d.code, title: d.title, type: 'decision' })),
    ...claims.map((c) => ({ id: c.id, code: c.code, title: c.statement, type: 'claim' })),
  ];

  const selectedTarget = allTargets.find((t) => t.id === selectedTargetId) || allTargets[0];

  // Helper to find all upstream nodes recursively
  const getUpstreamChain = (targetId: string): string[] => {
    const visited = new Set<string>();
    const queue = [targetId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!visited.has(current)) {
        visited.add(current);
        const incoming = relationships.filter((r) => r.targetId === current);
        for (const rel of incoming) {
          if (!visited.has(rel.sourceId)) {
            queue.push(rel.sourceId);
          }
        }
      }
    }
    return Array.from(visited);
  };

  const upstreamIds = selectedTarget ? new Set(getUpstreamChain(selectedTarget.id)) : new Set<string>();

  const linkedQuestions = questions.filter((q) => upstreamIds.has(q.id));
  const linkedPapers = papers.filter((p) => upstreamIds.has(p.id));
  const linkedGaps = gaps.filter((g) => upstreamIds.has(g.id));
  const linkedHypotheses = hypotheses.filter((h) => upstreamIds.has(h.id));
  const linkedExperiments = experiments.filter((e) => upstreamIds.has(e.id));
  const linkedResults = results.filter((r) => upstreamIds.has(r.id));

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Deterministic Traceability</h1>
        <p className="text-xs text-slate-500 mt-1">
          Trace backwards from any architectural decision or scientific claim to its empirical and literature roots.
        </p>
      </div>

      {allTargets.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No decisions or claims to trace"
          description="Create decisions or claims in this project to inspect their backward evidentiary provenance chains."
        />
      ) : (
        <div className="space-y-6">
          {/* Target Selector */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Decision or Claim to Trace
            </label>
            <select
              value={selectedTarget?.id}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            >
              {allTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.code}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Trace Lineage Path Card */}
          {selectedTarget && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                    {selectedTarget.code}
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedTarget.title}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Grounded Lineage
                </span>
              </div>

              {/* Provenance Stages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Motivating Literature & Gaps */}
                <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    <span>1. Literature & Inquiries</span>
                  </div>
                  {linkedQuestions.map((q) => (
                    <div key={q.id} className="rounded bg-white p-2.5 border border-slate-200/60 text-xs">
                      <span className="font-mono font-bold text-indigo-600 block text-[10px]">{q.code}</span>
                      <span className="font-medium text-slate-800 line-clamp-2">{q.title}</span>
                    </div>
                  ))}
                  {linkedPapers.map((p) => (
                    <div key={p.id} className="rounded bg-white p-2.5 border border-slate-200/60 text-xs">
                      <span className="font-mono font-bold text-blue-600 block text-[10px]">{p.code}</span>
                      <span className="font-medium text-slate-800 line-clamp-2">{p.title}</span>
                    </div>
                  ))}
                  {linkedGaps.map((g) => (
                    <div key={g.id} className="rounded bg-white p-2.5 border border-slate-200/60 text-xs">
                      <span className="font-mono font-bold text-amber-600 block text-[10px]">{g.code}</span>
                      <span className="font-medium text-slate-800 line-clamp-2">{g.title}</span>
                    </div>
                  ))}
                  {linkedQuestions.length === 0 && linkedPapers.length === 0 && linkedGaps.length === 0 && (
                    <p className="text-xs text-slate-400">Direct upstream question not connected.</p>
                  )}
                </div>

                {/* 2. Hypotheses & Experiments */}
                <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900">
                    <FlaskConical className="h-4 w-4 text-teal-600" />
                    <span>2. Hypotheses & Trials</span>
                  </div>
                  {linkedHypotheses.map((h) => (
                    <div key={h.id} className="rounded bg-white p-2.5 border border-slate-200/60 text-xs">
                      <span className="font-mono font-bold text-teal-600 block text-[10px]">{h.code}</span>
                      <span className="font-medium text-slate-800 line-clamp-2">{h.statement}</span>
                    </div>
                  ))}
                  {linkedExperiments.map((e) => (
                    <div key={e.id} className="rounded bg-white p-2.5 border border-slate-200/60 text-xs">
                      <span className="font-mono font-bold text-rose-600 block text-[10px]">{e.code}</span>
                      <span className="font-medium text-slate-800 line-clamp-2">{e.title}</span>
                    </div>
                  ))}
                  {linkedHypotheses.length === 0 && linkedExperiments.length === 0 && (
                    <p className="text-xs text-slate-400">No hypothesis directly linked.</p>
                  )}
                </div>

                {/* 3. Empirical Results */}
                <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-900">
                    <BarChart3 className="h-4 w-4 text-cyan-600" />
                    <span>3. Empirical Backing</span>
                  </div>
                  {linkedResults.map((r) => (
                    <div key={r.id} className="rounded bg-white p-2.5 border border-slate-200/60 text-xs">
                      <span className="font-mono font-bold text-cyan-600 block text-[10px]">{r.code}</span>
                      <span className="font-medium text-slate-800">{r.title}</span>
                      {r.metrics && (
                        <div className="mt-1.5 flex flex-wrap gap-1 font-mono text-[10px] text-slate-500">
                          {Object.entries(r.metrics).map(([k, v]) => (
                            <span key={k} className="bg-slate-100 px-1.5 py-0.5 rounded">
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {linkedResults.length === 0 && (
                    <p className="text-xs text-slate-400">No empirical result directly linked.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
