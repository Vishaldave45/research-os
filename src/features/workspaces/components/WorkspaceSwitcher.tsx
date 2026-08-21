import React, { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useProjectStore } from '../../projects/store/projectStore';
import { ChevronDown, Check, Plus, Building2 } from 'lucide-react';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const { fetchProjects } = useProjectStore();
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

  const handleSelect = async (ws: typeof activeWorkspace) => {
    if (!ws) return;
    setActiveWorkspace(ws);
    setIsOpen(false);
    // Reload projects for new workspace to prevent cross-workspace leakage
    await fetchProjects(ws.id);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
      >
        <Building2 className="h-4 w-4 text-indigo-600 shrink-0" />
        <span className="max-w-[160px] truncate">{activeWorkspace?.name || 'Select Workspace'}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Your Workspaces
          </div>
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {workspaces.map((ws) => {
              const isSelected = activeWorkspace?.id === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => handleSelect(ws)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition ${
                    isSelected
                      ? 'bg-indigo-50 font-semibold text-indigo-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
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
            <span>Create workspace</span>
          </button>
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          if (activeWorkspace) {
            fetchProjects(activeWorkspace.id);
          }
        }}
      />
    </div>
  );
};
