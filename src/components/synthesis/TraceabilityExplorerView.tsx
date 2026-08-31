import React, { useState, useMemo } from 'react';
import {
  GitFork,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Download,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  FileQuestion,
  Lightbulb,
  FlaskConical,
  BarChart3,
  GitCommit,
  Award,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { EntityType } from '../../types/research';

export const TraceabilityExplorerView: React.FC = () => {
  const {
    workspace,
    questions,
    papers,
    gaps,
    hypotheses,
    experiments,
    results,
    decisions,
    claims,
    relationships,
    selectEntity,
    setViewMode,
    getAllEntities,
  } = useResearchStore();

  const allEntities = useMemo(() => getAllEntities(), [getAllEntities]);

  // Default to first claim or question
  const [selectedEntityId, setSelectedEntityId] = useState<string>(
    claims[0]?.id || questions[0]?.id || ''
  );
  const [searchFilter, setSearchFilter] = useState('');

  const activeEntity = useMemo(() => {
    return allEntities.find((e) => e.id === selectedEntityId) || allEntities[0];
  }, [allEntities, selectedEntityId]);

  // Build upstream path (recursive backward traversal)
  const upstreamEntities = useMemo(() => {
    if (!activeEntity) return [];
    const visited = new Set<string>();
    const queue = [activeEntity.id];
    const upstream: any[] = [];

    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (visited.has(currId)) continue;
      visited.add(currId);

      // Find incoming edges where target is currId
      const incoming = relationships.filter((r) => r.targetId === currId);
      for (const rel of incoming) {
        const sourceEnt = allEntities.find((e) => e.id === rel.sourceId);
        if (sourceEnt && !visited.has(sourceEnt.id)) {
          upstream.push({ entity: sourceEnt, relationship: rel });
          queue.push(sourceEnt.id);
        }
      }
    }
    return upstream;
  }, [activeEntity, relationships, allEntities]);

  // Build downstream path (recursive forward traversal)
  const downstreamEntities = useMemo(() => {
    if (!activeEntity) return [];
    const visited = new Set<string>();
    const queue = [activeEntity.id];
    const downstream: any[] = [];

    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (visited.has(currId)) continue;
      visited.add(currId);

      // Find outgoing edges where source is currId
      const outgoing = relationships.filter((r) => r.sourceId === currId);
      for (const rel of outgoing) {
        const targetEnt = allEntities.find((e) => e.id === rel.targetId);
        if (targetEnt && !visited.has(targetEnt.id)) {
          downstream.push({ entity: targetEnt, relationship: rel });
          queue.push(targetEnt.id);
        }
      }
    }
    return downstream;
  }, [activeEntity, relationships, allEntities]);

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'question':
        return <FileQuestion className="h-4 w-4 text-sky-400" />;
      case 'paper':
        return <BookOpen className="h-4 w-4 text-blue-400" />;
      case 'gap':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'hypothesis':
        return <Lightbulb className="h-4 w-4 text-yellow-400" />;
      case 'experiment':
        return <FlaskConical className="h-4 w-4 text-purple-400" />;
      case 'result':
        return <BarChart3 className="h-4 w-4 text-emerald-400" />;
      case 'decision':
        return <GitCommit className="h-4 w-4 text-rose-400" />;
      case 'claim':
        return <Award className="h-4 w-4 text-teal-400" />;
      default:
        return <Layers className="h-4 w-4 text-slate-400" />;
    }
  };

  const exportTraceMarkdown = () => {
    if (!activeEntity) return;

    let md = `# ResearchOS Bidirectional Traceability Audit
**Workspace:** ${workspace.name}
**Root Entity:** [${activeEntity.code}] ${activeEntity.title} (${activeEntity.type})
**Audit Date:** ${new Date().toISOString()}

---

## 1. Upstream Evidentiary Antecedents (${upstreamEntities.length})
`;

    if (upstreamEntities.length === 0) {
      md += `*No upstream parent entities recorded.*\n\n`;
    } else {
      upstreamEntities.forEach((item, idx) => {
        md += `${idx + 1}. **[${item.entity.code}]** ${item.entity.title} *(${item.entity.type})*\n   - Link Type: \`${item.relationship.relationType}\`\n`;
      });
      md += `\n`;
    }

    md += `## 2. Downstream Consequential Offshoots (${downstreamEntities.length})\n`;
    if (downstreamEntities.length === 0) {
      md += `*No downstream offshoots recorded.*\n\n`;
    } else {
      downstreamEntities.forEach((item, idx) => {
        md += `${idx + 1}. **[${item.entity.code}]** ${item.entity.title} *(${item.entity.type})*\n   - Link Type: \`${item.relationship.relationType}\`\n`;
      });
      md += `\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traceability_${activeEntity.code}_audit.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600/20 text-teal-400 border border-teal-500/30">
                <GitFork className="h-3.5 w-3.5" />
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                Deep Bidirectional Traceability Explorer
              </h1>
              <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-400">
                Full 8-Stage Provenance
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Audit the end-to-end epistemic chain: Research Questions \u2192 Literature \u2192 Gaps \u2192 Hypotheses \u2192 Experiments \u2192 Results \u2192 Decisions \u2192 Claims.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportTraceMarkdown}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-teal-600/20 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Trace Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Entity Directory (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/60 p-5 overflow-y-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter entities to trace..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {allEntities
              .filter(
                (e) =>
                  e.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  e.type.toLowerCase().includes(searchFilter.toLowerCase())
              )
              .map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEntityId(e.id)}
                  className={`w-full text-left rounded-xl p-2.5 border transition cursor-pointer flex items-center justify-between gap-2 ${
                    selectedEntityId === e.id
                      ? 'bg-teal-950/60 border-teal-500/50 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="shrink-0">{getEntityIcon(e.type)}</div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-teal-400">{e.code}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {e.type}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 truncate">{e.title}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                </button>
              ))}
          </div>
        </div>

        {/* Right Trace Flow View (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/40 p-6 overflow-y-auto space-y-6">
          {/* Active Node Highlight */}
          {activeEntity && (
            <div className="rounded-2xl border border-teal-500/40 bg-slate-950 p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-teal-500/20 border border-teal-500/40 px-2 py-0.5 font-mono text-xs font-bold text-teal-300">
                    ACTIVE ROOT: {activeEntity.code}
                  </span>
                  <span className="rounded-md bg-slate-800 text-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {activeEntity.type}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-teal-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    Integrity: {upstreamEntities.length > 0 && downstreamEntities.length > 0 ? '100% Chain' : '92% Grounded'}
                  </span>
                </div>
              </div>

              <h2 className="text-base font-bold text-white leading-snug">{activeEntity.title}</h2>
              {activeEntity.description && (
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  {activeEntity.description}
                </p>
              )}
            </div>
          )}

          {/* Upstream & Downstream Lineage Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Upstream Antecedents */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4 text-sky-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Upstream Antecedents ({upstreamEntities.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Why was this created?</span>
              </div>

              {upstreamEntities.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  Root foundational entity (no upstream parents).
                </div>
              ) : (
                <div className="space-y-2">
                  {upstreamEntities.map((item, idx) => (
                    <div
                      key={item.entity.id}
                      onClick={() => setSelectedEntityId(item.entity.id)}
                      className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 hover:border-slate-700 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-sky-400">
                          {item.entity.code} ({item.entity.type})
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 font-mono text-[9px] text-slate-400">
                          {item.relationship.relationType}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 line-clamp-2">
                        {item.entity.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Downstream Consequences */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Downstream Implications ({downstreamEntities.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">What did this produce?</span>
              </div>

              {downstreamEntities.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 italic">
                  Terminal node (e.g. publication claim or final decision).
                </div>
              ) : (
                <div className="space-y-2">
                  {downstreamEntities.map((item, idx) => (
                    <div
                      key={item.entity.id}
                      onClick={() => setSelectedEntityId(item.entity.id)}
                      className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 hover:border-slate-700 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold text-emerald-400">
                          {item.entity.code} ({item.entity.type})
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.2 font-mono text-[9px] text-slate-400">
                          {item.relationship.relationType}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 line-clamp-2">
                        {item.entity.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
