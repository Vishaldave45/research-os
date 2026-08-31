import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  Layers,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Table,
  Plus,
  RefreshCw,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  FlaskConical,
  Activity,
  GitCommit,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { EntityType, ViewMode } from '../../types/research';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    getAllEntities,
    selectEntity,
    setViewMode,
    openCreateModal,
    resetToCanonicalDataset,
  } = useResearchStore();

  const [query, setQuery] = useState('');
  const allEntities = getAllEntities();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredEntities = allEntities.filter((e) => {
    const q = query.toLowerCase();
    return (
      e.code.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q)
    );
  });

  const actions: Array<{
    label: string;
    icon: React.ReactNode;
    handler: () => void;
    category: string;
  }> = [
    {
      label: 'Switch to Spatial Graph Canvas',
      icon: <Layers className="h-4 w-4 text-indigo-600" />,
      handler: () => {
        setViewMode('canvas');
        setCommandPaletteOpen(false);
      },
      category: 'Views',
    },
    {
      label: 'Switch to Literature Matrix View',
      icon: <BookOpen className="h-4 w-4 text-blue-600" />,
      handler: () => {
        setViewMode('matrix');
        setCommandPaletteOpen(false);
      },
      category: 'Views',
    },
    {
      label: 'Switch to AI Gap Discovery & Hypothesis Generator',
      icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
      handler: () => {
        setViewMode('gaps');
        setCommandPaletteOpen(false);
      },
      category: 'Views',
    },
    {
      label: 'Switch to Evidentiary Claim Auditor',
      icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
      handler: () => {
        setViewMode('claims');
        setCommandPaletteOpen(false);
      },
      category: 'Views',
    },
    {
      label: 'Switch to End-to-End Evidence Narrative',
      icon: <Sparkles className="h-4 w-4 text-purple-600" />,
      handler: () => {
        setViewMode('evidence_narrative');
        setCommandPaletteOpen(false);
      },
      category: 'Views',
    },
    {
      label: 'Switch to Structured Entity Table',
      icon: <Table className="h-4 w-4 text-slate-600" />,
      handler: () => {
        setViewMode('table');
        setCommandPaletteOpen(false);
      },
      category: 'Views',
    },
    {
      label: 'Reset to Canonical WCE Edge AI Research Project',
      icon: <RefreshCw className="h-4 w-4 text-rose-600" />,
      handler: () => {
        resetToCanonicalDataset();
        setCommandPaletteOpen(false);
      },
      category: 'System',
    },
    {
      label: 'Create New Research Hypothesis',
      icon: <Plus className="h-4 w-4 text-teal-600" />,
      handler: () => {
        openCreateModal('hypothesis');
        setCommandPaletteOpen(false);
      },
      category: 'Create',
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-24 p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={() => setCommandPaletteOpen(false)}
        className="fixed inset-0 z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4.5 py-3.5 bg-white shrink-0">
          <Search className="h-4.5 w-4.5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, jump to entity (e.g. H-001, P-002), or switch views..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden"
          />
          <kbd className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Actions & Views
              </div>
              <div className="space-y-1 mt-1">
                {filteredActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.handler}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      {action.icon}
                      <span>{action.label}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      {action.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Research Entities */}
          {filteredEntities.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Research Nodes ({filteredEntities.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredEntities.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      selectEntity(e.id, e.type);
                      setViewMode('canvas');
                      setCommandPaletteOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-indigo-50/70 hover:text-indigo-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-xs font-bold text-indigo-700">
                        {e.code}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 uppercase">
                        {e.type}
                      </span>
                      <span className="truncate text-xs font-medium text-slate-900 max-w-sm">
                        {e.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Jump →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

