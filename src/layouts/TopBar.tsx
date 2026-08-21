import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../features/auth/store/authStore';
import { useWorkspaceStore } from '../features/workspaces/store/workspaceStore';
import { useProjectStore } from '../features/projects/store/projectStore';
import { WorkspaceSwitcher } from '../features/workspaces/components/WorkspaceSwitcher';
import { ProjectSwitcher } from '../features/projects/components/ProjectSwitcher';
import { BrainCircuit, ChevronDown, User as UserIcon, LogOut, Settings } from 'lucide-react';

export interface TopBarProps {
  onNavigateToWorkspaceSettings?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onNavigateToWorkspaceSettings,
}) => {
  const { user, logout } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const { activeProject } = useProjectStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shrink-0 select-none z-30">
      {/* Left: Brand & Breadcrumb Hierarchy */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <BrainCircuit className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900 hidden sm:inline">
            ResearchOS
          </span>
        </div>

        {/* Dual Breadcrumbs */}
        <div className="flex items-center gap-1.5">
          <WorkspaceSwitcher />

          {activeProject && (
            <>
              <span className="text-slate-300 font-normal">/</span>
              <ProjectSwitcher />
            </>
          )}
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 font-semibold text-xs text-indigo-700">
            {user?.full_name?.charAt(0) || user?.email.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="max-w-[120px] truncate hidden md:inline">
            {user?.full_name || user?.email.split('@')[0]}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.full_name || 'Researcher'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {user?.email}
              </div>
            </div>

            <div className="py-1">
              {onNavigateToWorkspaceSettings && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigateToWorkspaceSettings();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Workspace Settings</span>
                </button>
              )}
            </div>

            <div className="border-t border-slate-100 pt-1">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
