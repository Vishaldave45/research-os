import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useWorkspaceStore } from '../../workspaces/store/workspaceStore';
import { ChevronDown, Check, Plus, FolderKanban } from 'lucide-react';
import { CreateProjectModal } from './CreateProjectModal';

export const ProjectSwitcher: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const { projects, activeProject, setActiveProject, fetchProjects } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (project: typeof activeProject) => {
    setActiveProject(project);
    setIsOpen(false);
  };

  if (!activeWorkspace) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
      >
        <FolderKanban className="h-4 w-4 text-indigo-600 shrink-0" />
        <span className="max-w-[180px] truncate">{activeProject?.name || 'Select Project'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Research Projects
          </div>
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {projects.map((proj) => {
              const isSelected = activeProject?.id === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => handleSelect(proj)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition ${
                    isSelected
                      ? 'bg-indigo-50 font-semibold text-indigo-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate font-medium">{proj.name}</div>
                    {proj.researchArea && (
                      <div className="text-[10px] text-slate-400">{proj.researchArea}</div>
                    )}
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="my-1 border-t border-slate-100" />

          <button
            onClick={() => {
              setIsOpen(false);
              setIsCreateModalOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </button>
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(created) => {
          setActiveProject(created);
        }}
      />
    </div>
  );
};
