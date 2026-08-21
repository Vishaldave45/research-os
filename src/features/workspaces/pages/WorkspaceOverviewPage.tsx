import React from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useProjectStore } from '../../projects/store/projectStore';
import { FolderKanban, Users, Activity, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';
import { Project } from '../../../types/research';

export interface WorkspaceOverviewPageProps {
  onNavigateToProjects: () => void;
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
}

export const WorkspaceOverviewPage: React.FC<WorkspaceOverviewPageProps> = ({
  onNavigateToProjects,
  onSelectProject,
  onCreateProject,
}) => {
  const { activeWorkspace, members } = useWorkspaceStore();
  const { projects } = useProjectStore();

  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workspace Overview
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {activeWorkspace?.name || 'Research Workspace'}
          </h1>
          {activeWorkspace?.description && (
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {activeWorkspace.description}
            </p>
          )}
        </div>

        <button
          onClick={onCreateProject}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Projects</span>
            <FolderKanban className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{projects.length}</div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Members</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{Math.max(1, members.length)}</div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Lines</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{activeProjectsCount}</div>
        </div>
      </div>

      {/* Research Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Research Projects
          </h2>
          {projects.length > 0 && (
            <button
              onClick={onNavigateToProjects}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
            >
              <span>View all projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No research projects yet"
            description="Create your first research project line to start organizing questions, papers, hypotheses, and experiments."
            actionLabel="+ Create Project"
            onAction={onCreateProject}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        {project.name}
                      </h3>
                      {project.researchArea && (
                        <span className="text-xs text-indigo-600 font-medium">
                          {project.researchArea}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={project.status} />
                  </div>

                  {project.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>
                      {project.summary?.questionsCount || 0} questions
                    </span>
                    <span>·</span>
                    <span>
                      {project.summary?.experimentsCount || 0} experiments
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition">
                    Open Project
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
