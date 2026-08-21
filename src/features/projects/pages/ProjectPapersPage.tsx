import React from 'react';
import { useResearchStore } from '../../../store/useResearchStore';
import { BookOpen, Plus, ExternalLink } from 'lucide-react';
import { EmptyState } from '../../../shared/components/EmptyState';

export const ProjectPapersPage: React.FC = () => {
  const { papers, openCreateModal, resetToCanonicalDataset } = useResearchStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Literature Papers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Peer-reviewed publications, baseline benchmarks, and foundational literature.
          </p>
        </div>

        <button
          onClick={() => openCreateModal('paper')}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Paper</span>
        </button>
      </div>

      {papers.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No literature papers added"
          description="Log key citations, baseline architectures, or datasets that ground your research."
          actionLabel="+ Add Paper"
          onAction={() => openCreateModal('paper')}
          secondaryActionLabel="Seed Canonical Dataset"
          onSecondaryAction={() => resetToCanonicalDataset()}
        />
      ) : (
        <div className="space-y-4">
          {papers.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                  {p.code}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {p.year && <span>{p.year}</span>}
                  {p.venue && <span>· {p.venue}</span>}
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {p.title}
                </h3>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {p.authors && p.authors.length > 0 && (
                <p className="text-xs font-medium text-slate-500">
                  {p.authors.join(', ')}
                </p>
              )}

              {p.abstract && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {p.abstract}
                </p>
              )}

              {p.notes && (
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs text-slate-700">
                  <strong>Notes:</strong> {p.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
