import React from 'react';
import { useResearchStore } from '../../../store/useResearchStore';
import { HelpCircle, Plus, Sparkles } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';

export const ProjectQuestionsPage: React.FC = () => {
  const { questions, openCreateModal, resetToCanonicalDataset } = useResearchStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research Questions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Core scientific and engineering inquiries motivating this research project.
          </p>
        </div>

        <button
          onClick={() => openCreateModal('question')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Question</span>
        </button>
      </div>

      {questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No research questions recorded"
          description="Formulate the primary scientific inquiry or engineering challenge that defines this line of inquiry."
          actionLabel="+ Add Question"
          onAction={() => openCreateModal('question')}
          secondaryActionLabel="Seed Canonical Dataset"
          onSecondaryAction={() => resetToCanonicalDataset()}
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  {q.code}
                </span>
                <div className="flex items-center gap-2">
                  {q.priority && <StatusBadge status={q.priority} />}
                  <StatusBadge status={q.status} />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {q.title}
              </h3>

              {q.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {q.description}
                </p>
              )}

              {q.metadata && Object.keys(q.metadata).length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {Object.entries(q.metadata).map(([key, val]) => (
                    <span
                      key={key}
                      className="rounded-md bg-slate-50 px-2 py-1 border border-slate-100 font-mono text-[10px]"
                    >
                      <strong className="text-slate-700">{key}:</strong> {Array.isArray(val) ? val.join(', ') : String(val)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
