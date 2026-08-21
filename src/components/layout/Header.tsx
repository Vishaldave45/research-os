import React from 'react';
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
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
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

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-2xs backdrop-blur select-none z-30">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xs">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              ResearchOS
            </span>
            <span className="ml-1.5 rounded bg-indigo-50 px-1.5 py-0.2 text-[9px] font-bold font-mono text-indigo-700 uppercase">
              Core v2
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2.5 py-1 text-xs font-semibold text-slate-800 max-w-xs truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">{workspace.name}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            ({totalNodes} nodes • {relationships.length} edges)
          </span>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <nav className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/60">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => setViewMode(item.mode)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              viewMode === item.mode
                ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Actions and Utilities */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search / Cmd+K</span>
          <kbd className="hidden sm:inline rounded bg-white px-1.5 py-0.2 text-[10px] font-mono text-slate-400 border border-slate-200">
            ⌘K
          </kbd>
        </button>

        {/* AI Copilot Trigger */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:from-indigo-700 hover:to-purple-700 transition-all cursor-pointer"
        >
          <Bot className="h-3.5 w-3.5" />
          <span className="hidden md:inline">AI Copilot</span>
        </button>

        {/* Link Node */}
        <button
          onClick={() => openLinkModal()}
          title="Connect two research nodes"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Link2 className="h-4 w-4" />
        </button>

        {/* Create Node */}
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Node</span>
        </button>

        {/* Reset Canonical Seed */}
        <button
          onClick={() => {
            if (confirm('Reset workspace to Canonical WCE Edge AI Research Project?')) {
              resetToCanonicalDataset();
            }
          }}
          title="Reset to Canonical WCE dataset"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-slate-50 hover:text-rose-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
