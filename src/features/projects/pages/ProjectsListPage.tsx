import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useWorkspaceStore } from '../../workspaces/store/workspaceStore';
import { FolderKanban, Plus, ArrowRight, Search, Sparkles } from 'lucide-react';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { Project } from '../../../types/research';

export interface ProjectsListPageProps {
  onSelectProject: (project: Project) => void;
  onSeedCanonicalDataset?: () => void;
}

export const ProjectsListPage: React.FC<ProjectsListPageProps> = ({
  onSelectProject,
  onSeedCanonicalDataset,
}) => {
  const { activeWorkspace } = useWorkspaceStore();
  const { projects } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.researchArea && p.researchArea.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Research Projects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage the research lines and experimental campaigns within {activeWorkspace?.name || 'this workspace'}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onSeedCanonicalDataset && projects.length === 0 && (
            <button
              onClick={onSeedCanonicalDataset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Seed WCE Dataset</span>
            </button>
          )}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      {projects.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, domain, or description..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          />
        </div>
      )}

      {/* Projects Cards Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No research projects yet"
          description="Create your first research project line to start organizing your inquiries, papers, hypotheses, and benchmark trials."
          actionLabel="+ Create Project"
          onAction={() => setIsCreateModalOpen(true)}
          secondaryActionLabel={onSeedCanonicalDataset ? "Seed WCE Dataset" : undefined}
          onSecondaryAction={onSeedCanonicalDataset}
        />
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          No projects matched your search "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {project.researchArea || 'General Science'}
                  </span>
                  <StatusBadge status={project.status} />
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Questions {project.summary?.questionsCount || 0}</span>
                  <span>·</span>
                  <span>Experiments {project.summary?.experimentsCount || 0}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(created) => onSelectProject(created)}
      />
    </div>
  );
};
