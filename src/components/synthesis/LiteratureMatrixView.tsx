import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ExternalLink,
  Plus,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';

export const LiteratureMatrixView: React.FC = () => {
  const { papers, getLiteratureMatrix, selectEntity, openCreateModal } = useResearchStore();
  const matrix = getLiteratureMatrix();
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = matrix.filter(
    (row) =>
      row.paperCode.toLowerCase().includes(filterQuery.toLowerCase()) ||
      row.paperTitle.toLowerCase().includes(filterQuery.toLowerCase()) ||
      row.authors.toLowerCase().includes(filterQuery.toLowerCase()) ||
      row.methodology.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200/90 bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 shadow-2xs">
                <BookOpen className="h-4 w-4" />
              </div>
              <h2 className="text-base lg:text-lg font-bold text-slate-900 tracking-tight">
                Literature Matrix & State-of-the-Art Review
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Comparative analysis of research publications, hardware constraints, methodologies, and empirical trade-offs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter matrix by author, methodology, title..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-72 rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
            />
            <button
              onClick={() => openCreateModal('paper')}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Paper</span>
            </button>
          </div>
        </div>
      </div>

      {/* Synthesis Insight Banner */}
      <div className="mx-6 mt-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white p-4.5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-2xs shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                Literature Synthesis Consensus & Core Tension
              </h4>
              <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono px-2 py-0.2 font-semibold">
                {papers.length} Papers Synced
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-700 max-w-4xl">
              Across <strong>{papers.length} peer-reviewed publications</strong>, standard Vision Transformers provide high polyp sensitivity but hit an insurmountable thermal dissipation wall (&gt;12W vs. 2.4W safety ceiling in P-004). Uniform 4-bit INT quantization reduces power but causes a 7.2% sensitivity drop due to mucosal boundary clipping (P-002). <strong>Spatial patch folding (P-003)</strong> emerges as the critical bridging methodology to maintain both high frame-rate and sub-millimeter lesion gradient accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/90 font-semibold text-slate-700 sticky top-0 backdrop-blur z-10">
                <th className="py-3.5 px-4.5">Code & Paper</th>
                <th className="py-3.5 px-4.5">Authors / Venue</th>
                <th className="py-3.5 px-4.5">Methodology</th>
                <th className="py-3.5 px-4.5">Key Constraints & Metrics</th>
                <th className="py-3.5 px-4.5">Strengths</th>
                <th className="py-3.5 px-4.5">Identified Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr
                  key={row.paperId}
                  onClick={() => selectEntity(row.paperId, 'paper')}
                  className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                >
                  <td className="py-4 px-4.5 align-top">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                        {row.paperCode}
                      </span>
                    </div>
                    <div className="mt-1.5 font-semibold text-slate-900 max-w-xs leading-snug group-hover:text-blue-700 transition-colors">
                      {row.paperTitle}
                    </div>
                  </td>

                  <td className="py-4 px-4.5 align-top text-slate-600 max-w-[190px]">
                    <div className="line-clamp-2 font-medium text-slate-800">{row.authors}</div>
                    <div className="mt-1 text-[11px] font-semibold text-slate-400">
                      {row.venue} ({row.year})
                    </div>
                  </td>

                  <td className="py-4 px-4.5 align-top">
                    <span className="inline-block rounded-lg bg-slate-100/90 border border-slate-200/60 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
                      {row.methodology}
                    </span>
                  </td>

                  <td className="py-4 px-4.5 align-top">
                    <div className="space-y-1 font-mono text-[11px]">
                      {Object.entries(row.keyMetrics).map(([k, v]) => (
                        <div key={k} className="text-slate-700 flex items-center gap-1.5">
                          <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">{k}:</span>
                          <span className="font-semibold text-slate-900 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200/50">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-4.5 align-top max-w-[210px]">
                    <ul className="space-y-1.5">
                      {row.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="py-4 px-4.5 align-top max-w-[210px]">
                    <ul className="space-y-1.5">
                      {row.limitations.map((l, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{l}</span>
                        </li>
                      ))}
                    </ul>
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
