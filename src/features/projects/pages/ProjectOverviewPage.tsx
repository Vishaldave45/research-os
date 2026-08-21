import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { useResearchStore } from '../../../store/useResearchStore';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { ProjectPipelineBar } from '../components/ProjectPipelineBar';
import {
  Lightbulb,
  FlaskConical,
  GitBranch,
  ArrowRight,
  Sparkles,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { Project } from '../../../types/research';

export interface ProjectOverviewPageProps {
  onNavigateSection: (section: string) => void;
}

export const ProjectOverviewPage: React.FC<ProjectOverviewPageProps> = ({
  onNavigateSection,
}) => {
  const { activeProject } = useProjectStore();
  const { hypotheses, experiments, decisions, questions, papers, resetToCanonicalDataset, isSyncing } = useResearchStore();

  if (!activeProject) return null;

  const activeHypotheses = hypotheses.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      {/* Project Banner Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {activeProject.researchArea || 'Research Project'}
              </span>
              <span>·</span>
              <StatusBadge status={activeProject.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {activeProject.name}
            </h1>

            {activeProject.description && (
              <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
                {activeProject.description}
              </p>
            )}
          </div>

          {hypotheses.length === 0 && (
            <button
              onClick={() => resetToCanonicalDataset()}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer self-start shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isSyncing ? 'Loading dataset...' : 'Seed Canonical Dataset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Research Pipeline Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Research Reasoning Pipeline
          </h2>
          <span className="text-xs text-slate-400">Deterministic evidentiary progression</span>
        </div>
        <ProjectPipelineBar
          summary={activeProject.summary}
          onStageClick={(stage) => onNavigateSection(stage)}
        />
      </div>

      {/* Two Column Section: Active Hypotheses & Recent Pipeline Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Hypotheses Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-teal-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Active Hypotheses
              </h3>
            </div>
            <button
              onClick={() => onNavigateSection('hypotheses')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
            >
              View all ({hypotheses.length})
            </button>
          </div>

          {activeHypotheses.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No hypotheses formulated yet. Start by formulating testable conjectures.
            </p>
          ) : (
            <div className="space-y-3">
              {activeHypotheses.map((h) => (
                <div
                  key={h.id}
                  onClick={() => onNavigateSection('hypotheses')}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 hover:border-indigo-200 hover:bg-indigo-50/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-teal-700">
                      {h.code}
                    </span>
                    <StatusBadge status={h.status} size="sm" />
                  </div>
                  <p className="text-xs font-medium text-slate-800 line-clamp-2">
                    {h.statement}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Decisions & Milestones Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Architecture Decisions
              </h3>
            </div>
            <button
              onClick={() => onNavigateSection('decisions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
            >
              View all ({decisions.length})
            </button>
          </div>

          {decisions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No architectural or scientific decisions recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {decisions.slice(0, 3).map((d) => (
                <div
                  key={d.id}
                  onClick={() => onNavigateSection('decisions')}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5 hover:border-purple-200 hover:bg-purple-50/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-purple-700">
                      {d.code}
                    </span>
                    <StatusBadge status={d.outcome} size="sm" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {d.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {d.rationale}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
