import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { EntityType, ResearchEntity } from '../../types/research';

export const EntityTableView: React.FC = () => {
  const {
    selectEntity,
    setViewMode,
    openCreateModal,
  } = useResearchStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');
  const [sortField, setSortField] = useState<'code' | 'title' | 'type' | 'createdAt'>('type');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Bolt Optimization: Subscribe directly to individual entity slices from Zustand
  // and memoize aggregation, filtering, and sorting operations.
  // This avoids re-creating array copies and re-executing string formatting/sorting on every render frame
  // (e.g. during typing in search input before state update finishes or unrelated store updates).
  const questions = useResearchStore((s) => s.questions);
  const papers = useResearchStore((s) => s.papers);
  const gaps = useResearchStore((s) => s.gaps);
  const hypotheses = useResearchStore((s) => s.hypotheses);
  const experiments = useResearchStore((s) => s.experiments);
  const results = useResearchStore((s) => s.results);
  const decisions = useResearchStore((s) => s.decisions);
  const claims = useResearchStore((s) => s.claims);

  const allEntities = useMemo(() => {
    return [
      ...questions,
      ...papers,
      ...gaps,
      ...hypotheses,
      ...experiments,
      ...results,
      ...decisions,
      ...claims,
    ];
  }, [questions, papers, gaps, hypotheses, experiments, results, decisions, claims]);

  const sorted = useMemo(() => {
    const filtered = allEntities.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = `${e.code} ${e.title} ${e.type}`.toLowerCase();
        return text.includes(q);
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allEntities, typeFilter, search, sortField, sortOrder]);

  const exportCSV = () => {
    const headers = ['Code', 'Type', 'Title', 'Status', 'Created At'];
    const rows = sorted.map((e) => [
      e.code,
      e.type,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      (e as any).status || (e as any).outcome || 'N/A',
      e.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `researchos_entities_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const badgeColors: Record<EntityType, string> = {
    question: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    paper: 'bg-blue-50 text-blue-700 border-blue-200',
    evidence: 'bg-amber-50 text-amber-700 border-amber-200',
    gap: 'bg-amber-50 text-amber-800 border-amber-200',
    hypothesis: 'bg-teal-50 text-teal-800 border-teal-200',
    experiment: 'bg-rose-50 text-rose-800 border-rose-200',
    result: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    decision: 'bg-purple-50 text-purple-800 border-purple-200',
    claim: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200/90 bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/80 text-slate-800 shadow-2xs">
                <TableIcon className="h-4 w-4" />
              </div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">
                Research Entity Repository & Registry
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Complete index of all {allEntities.length} research objects across the reasoning lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => openCreateModal()}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Entity</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search across all entities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 bg-transparent focus:outline-hidden text-xs text-slate-800"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Entity Types</option>
              <option value="question">Questions</option>
              <option value="paper">Papers</option>
              <option value="gap">Gaps</option>
              <option value="hypothesis">Hypotheses</option>
              <option value="experiment">Experiments</option>
              <option value="result">Results</option>
              <option value="decision">Decisions</option>
              <option value="claim">Claims</option>
            </select>
          </div>

          <div className="text-xs font-medium text-slate-500">
            Showing <strong className="text-slate-900">{sorted.length}</strong> of {allEntities.length} records
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/90 font-semibold text-slate-700 sticky top-0 backdrop-blur z-10">
                <th
                  onClick={() => {
                    setSortField('code');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3.5 px-4.5 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Code</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('type');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3.5 px-4.5 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Type</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('title');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="py-3.5 px-4.5 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Title / Primary Statement</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4.5">Status / Outcome</th>
                <th className="py-3.5 px-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((entity) => (
                <tr
                  key={entity.id}
                  onClick={() => {
                    selectEntity(entity.id, entity.type);
                    setViewMode('canvas');
                  }}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4.5 font-mono font-bold text-slate-900">
                    <span className="bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded-md">
                      {entity.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4.5">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        badgeColors[entity.type]
                      }`}
                    >
                      {entity.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4.5 font-medium text-slate-900 max-w-md truncate group-hover:text-indigo-600 transition-colors">
                    {entity.title || (entity as any).statement || (entity as any).description}
                  </td>
                  <td className="py-3.5 px-4.5 capitalize text-slate-600 font-medium">
                    {(entity as any).status || (entity as any).outcome || '—'}
                  </td>
                  <td className="py-3.5 px-4.5 text-right">
                    <span className="text-[11px] text-indigo-600 font-bold group-hover:underline">
                      Focus on Canvas →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
