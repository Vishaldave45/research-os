import React, { useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useProjectStore } from '../../projects/store/projectStore';
import { Building2, Plus, ArrowRight, Users, Check } from 'lucide-react';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { Workspace } from '../../../types/research';

export interface WorkspaceSelectionPageProps {
  onWorkspaceSelected: (workspace: Workspace) => void;
}

export const WorkspaceSelectionPage: React.FC<WorkspaceSelectionPageProps> = ({
  onWorkspaceSelected,
}) => {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const { fetchProjects } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSelect = async (ws: Workspace) => {
    setActiveWorkspace(ws);
    await fetchProjects(ws.id);
    onWorkspaceSelected(ws);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-900 p-6 text-slate-100">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Select your workspace</h2>
          <p className="mt-1 text-xs text-slate-400">
            Choose a research lab or create a new collaborative workspace.
          </p>
        </div>

        <div className="space-y-3">
          {workspaces.map((ws) => {
            const isSelected = activeWorkspace?.id === ws.id;
            return (
              <div
                key={ws.id}
                onClick={() => handleSelect(ws)}
                className={`group flex items-center justify-between rounded-xl border p-4 transition cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-800/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                      {ws.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {ws.description || 'Research collaboration workspace'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                      Active
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-800/30 p-4 text-xs font-semibold text-slate-300 hover:border-indigo-500 hover:bg-indigo-500/5 hover:text-indigo-400 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create new workspace</span>
          </button>
        </div>
      </div>

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          if (activeWorkspace) {
            onWorkspaceSelected(activeWorkspace);
          }
        }}
      />
    </div>
  );
};
