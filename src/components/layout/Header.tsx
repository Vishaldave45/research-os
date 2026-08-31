import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Layers,
  BookOpen,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Table,
  Plus,
  RefreshCw,
  Search,
  Bot,
  Link2,
  LogOut,
  ChevronDown,
  Building2,
  Check,
  Users,
  FolderKanban,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useWorkspaceStore } from '../../features/workspaces/store/workspaceStore';
import { useProjectStore } from '../../features/projects/store/projectStore';
import { CreateWorkspaceModal } from '../../features/workspaces/components/CreateWorkspaceModal';
import { CreateProjectModal } from '../../features/projects/components/CreateProjectModal';
import { WorkspaceMembersModal } from '../modals/WorkspaceMembersModal';
import { ViewMode } from '../../types/research';

export const Header: React.FC = () => {
  const {
    workspace,
    viewMode,
    setViewMode,
    openCreateModal,
    openLinkModal,
    setCommandPaletteOpen,
    setAiModalOpen,
    resetToCanonicalDataset,
    syncFromBackend,
    questions,
    papers,
    gaps,
    hypotheses,
    experiments,
    results,
    decisions,
    claims,
    relationships,
  } = useResearchStore();

  const { user, logout } = useAuthStore();
  const { workspaces, activeWorkspace, setActiveWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const { projects, activeProject, setActiveProject, fetchProjects } = useProjectStore();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (activeWorkspace) {
      fetchProjects(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchProjects]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) {
        setIsProjectMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: Array<{ mode: ViewMode; label: string; icon: React.ReactNode }> = [
    { mode: 'canvas', label: 'Spatial Graph', icon: <Layers className="h-3.5 w-3.5" /> },
    { mode: 'matrix', label: 'Literature Matrix', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { mode: 'gaps', label: 'AI Gap Discovery', icon: <AlertCircle className="h-3.5 w-3.5" /> },
    { mode: 'claims', label: 'Claim Auditor', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { mode: 'evidence_narrative', label: 'Evidence Narrative', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { mode: 'table', label: 'Entity Registry', icon: <Table className="h-3.5 w-3.5" /> },
  ];

  const totalNodes =
    questions.length +
    papers.length +
    gaps.length +
    hypotheses.length +
    experiments.length +
    results.length +
    decisions.length +
    claims.length;

  const currentWorkspaceName = activeWorkspace?.name || workspace.name || "Research Lab";

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-3 lg:px-5 shadow-xs backdrop-blur-md select-none z-30 shrink-0">
      {/* Left: Brand & Workspace / Project Dropdowns */}
      <div className="flex items-center gap-2.5 lg:gap-3.5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setViewMode('canvas')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-sm ring-1 ring-indigo-700/20">
            <Compass className="h-4 w-4" />
          </div>
          <div className="flex items-center">
            <span className="font-bold text-sm tracking-tight text-slate-900 hidden sm:inline">
              ResearchOS
            </span>
            <span className="ml-1.5 rounded-md bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 text-[9px] font-bold font-mono text-indigo-700 uppercase tracking-wide">
              Core v2
            </span>
          </div>
        </div>

        {/* Workspace Dropdown Switcher */}
        <div className="relative pl-2.5 lg:pl-3.5 border-l border-slate-200" ref={workspaceRef}>
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center gap-2 rounded-lg bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/70 px-2.5 py-1 text-xs font-semibold text-slate-800 transition cursor-pointer"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0" />
            <span className="max-w-[130px] lg:max-w-[170px] truncate">{currentWorkspaceName}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-68 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Workspaces ({workspaces.length})
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1 my-1">
                {workspaces.map((ws) => {
                  const isSelected = (activeWorkspace?.id || workspace.id) === ws.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setActiveWorkspace(ws);
                        setIsWorkspaceMenuOpen(false);
                        syncFromBackend();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-left transition ${
                        isSelected
                          ? 'bg-indigo-50/80 font-semibold text-indigo-900 border border-indigo-200/60'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold truncate">{ws.name}</div>
                        {ws.description && (
                          <div className="text-[10px] text-slate-400 truncate">{ws.description}</div>
                        )}
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-1.5 mt-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    setIsMembersModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>Workspace Members</span>
                </button>

                <button
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    setIsCreateWorkspaceOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Project Dropdown Switcher */}
        {projects.length > 0 && (
          <div className="relative hidden md:block" ref={projectRef}>
            <button
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
            >
              <FolderKanban className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="max-w-[130px] truncate">{activeProject?.name || 'All Projects'}</span>
              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
            </button>

            {isProjectMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Research Projects
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 my-1">
                  {projects.map((proj) => {
                    const isSelected = activeProject?.id === proj.id;
                    return (
                      <button
                        key={proj.id}
                        onClick={() => {
                          setActiveProject(proj);
                          setIsProjectMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-left transition ${
                          isSelected
                            ? 'bg-indigo-50/80 font-semibold text-indigo-900 border border-indigo-200/60'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate font-semibold">{proj.name}</div>
                          {proj.researchArea && (
                            <div className="text-[10px] text-slate-400">{proj.researchArea}</div>
                          )}
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 pt-1.5 mt-1">
                  <button
                    onClick={() => {
                      setIsProjectMenuOpen(false);
                      setIsCreateProjectOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <span className="font-mono text-[10px] text-slate-400 hidden 2xl:inline">
          ({totalNodes} nodes • {relationships.length} edges)
        </span>
      </div>

      {/* Navigation View Switcher (The 6 core tabs) */}
      <nav className="flex items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/80">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => setViewMode(item.mode)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 lg:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              viewMode === item.mode
                ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Actions and Utilities */}
      <div className="flex items-center gap-1.5 lg:gap-2">
        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 lg:px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-2xs"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden xl:inline">Search</span>
          <kbd className="hidden lg:inline rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* AI Copilot Trigger */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
        >
          <Bot className="h-3.5 w-3.5" />
          <span className="hidden md:inline">AI Copilot</span>
        </button>

        {/* Link Node */}
        <button
          onClick={() => openLinkModal()}
          title="Connect two research nodes"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer shadow-2xs"
        >
          <Link2 className="h-4 w-4" />
        </button>

        {/* Create Node */}
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Node</span>
        </button>

        {/* Sync / Reset */}
        <button
          onClick={() => {
            if (confirm('Reset workspace to Canonical WCE Edge AI Research Project?')) {
              resetToCanonicalDataset();
            }
          }}
          title="Seed / Reset to Canonical WCE dataset"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition cursor-pointer shadow-2xs"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Auth Profile / Logout Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title="Manage Researcher Profile & Session"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-[11px] font-bold ring-2 ring-indigo-100">
              {(user?.full_name || 'R').charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-medium max-w-[110px] truncate text-slate-800">
              {user?.full_name || 'Researcher'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'Researcher'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'authenticated session'}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-semibold text-indigo-700 uppercase tracking-wide">
                  {user?.role || 'Researcher'}
                </span>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsMembersModalOpen(true);
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>Workspace Members</span>
              </button>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out of Session</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals for Workspace & Project Creation & Members */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onSuccess={() => syncFromBackend()}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={(proj) => {
          setActiveProject(proj);
          if (activeWorkspace) fetchProjects(activeWorkspace.id);
        }}
      />

      <WorkspaceMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />
    </header>
  );
};
