import React from 'react';
import { LayoutDashboard, FolderKanban, Users, Settings } from 'lucide-react';
import { WorkspaceViewMode } from '../types/research';

export interface WorkspaceSidebarProps {
  currentView: WorkspaceViewMode;
  onSelectView: (view: WorkspaceViewMode) => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  currentView,
  onSelectView,
}) => {
  const navItems: Array<{ id: WorkspaceViewMode; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 h-full border-r border-slate-200 bg-white flex flex-col justify-between p-3 shrink-0 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-500 space-y-0.5">
        <div className="font-semibold text-slate-700">ResearchOS Core</div>
        <div>v0.2 Verified Architecture</div>
      </div>
    </aside>
  );
};
