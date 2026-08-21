import React from 'react';
import {
  GitCommit,
  ArrowDown,
  Sparkles,
  HelpCircle,
  BookOpen,
  AlertCircle,
  Lightbulb,
  FlaskConical,
  Activity,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';

export const EvidenceChainView: React.FC = () => {
  const {
    questions,
    papers,
    gaps,
    hypotheses,
    experiments,
    results,
    decisions,
    claims,
    selectEntity,
    setViewMode,
  } = useResearchStore();

  const stages = [
    {
      title: '1. Clinical Research Inquiries',
      icon: <HelpCircle className="h-4 w-4 text-indigo-600" />,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      items: questions.map((q) => ({
        id: q.id,
        code: q.code,
        type: 'question',
        title: q.title,
        status: q.status,
      })),
    },
    {
      title: '2. Published Literature Foundation',
      icon: <BookOpen className="h-4 w-4 text-blue-600" />,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      items: papers.map((p) => ({
        id: p.id,
        code: p.code,
        type: 'paper',
        title: p.title,
        meta: `${p.venue} (${p.year})`,
      })),
    },
    {
      title: '3. Formulated Literature Gaps',
      icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      items: gaps.map((g) => ({
        id: g.id,
        code: g.code,
        type: 'gap',
        title: g.title,
        meta: `${g.impactLevel} impact`,
      })),
    },
    {
      title: '4. Testable Hypotheses',
      icon: <Lightbulb className="h-4 w-4 text-teal-600" />,
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      items: hypotheses.map((h) => ({
        id: h.id,
        code: h.code,
        type: 'hypothesis',
        title: h.statement,
        meta: `${Math.round((h.confidence || 0) * 100)}% conf | ${h.status}`,
      })),
    },
    {
      title: '5. Hardware Benchmarks & Experiments',
      icon: <FlaskConical className="h-4 w-4 text-rose-600" />,
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      items: experiments.map((e) => ({
        id: e.id,
        code: e.code,
        type: 'experiment',
        title: e.title,
        meta: e.status,
      })),
    },
    {
      title: '6. Empirical Metrics & Results',
      icon: <Activity className="h-4 w-4 text-cyan-600" />,
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      items: results.map((r) => ({
        id: r.id,
        code: r.code,
        type: 'result',
        title: r.title,
        meta: r.summary,
      })),
    },
    {
      title: '7. Engineering Decisions & Verdicts',
      icon: <GitCommit className="h-4 w-4 text-purple-600" />,
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      items: decisions.map((d) => ({
        id: d.id,
        code: d.code,
        type: 'decision',
        title: d.title,
        meta: `Outcome: ${d.outcome}`,
      })),
    },
    {
      title: '8. Verified Scientific Claims',
      icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      items: claims.map((c) => ({
        id: c.id,
        code: c.code,
        type: 'claim',
        title: c.statement,
        meta: `${Math.round(c.confidenceScore * 100)}% Verified`,
      })),
    },
  ];

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              End-to-End Evidence Narrative
            </h2>
            <p className="text-xs text-slate-500">
              Complete traceable provenance from clinical query down to final verified production decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Narrative Pipeline Flow */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {stages.map((stage, idx) => (
            <div key={idx} className="relative">
              {/* Vertical connector line */}
              {idx < stages.length - 1 && (
                <div className="absolute left-6 top-10 bottom--6 w-0.5 bg-slate-200 -z-10" />
              )}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                      {stage.icon}
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      {stage.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    {stage.items.length} items
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {stage.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        selectEntity(item.id, item.type as any);
                        setViewMode('canvas');
                      }}
                      className="group cursor-pointer rounded-lg border border-slate-200 bg-slate-50/60 p-3 hover:border-indigo-400 hover:bg-white transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {item.code}
                        </span>
                        {item.meta && (
                          <span className="text-[10px] font-medium text-slate-500 truncate max-w-[150px]">
                            {item.meta}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-900 line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
