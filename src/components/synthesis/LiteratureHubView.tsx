import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Tag,
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  Link2,
  Trash2,
  Filter,
  CheckCircle2,
  BookmarkPlus,
  BookMarked,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { PaperEntity, EntityType } from '../../types/research';

export const LiteratureHubView: React.FC = () => {
  const {
    papers,
    questions,
    gaps,
    hypotheses,
    claims,
    addEntity,
    deleteEntity,
    selectEntity,
    setViewMode,
    addRelationship,
    relationships,
  } = useResearchStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'doi' | 'arxiv' | 'bibtex' | 'manual'>('doi');

  // Import form state
  const [importInput, setImportInput] = useState('');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [importedPreview, setImportedPreview] = useState<Partial<PaperEntity> | null>(null);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.abstract && p.abstract.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchVenue = selectedVenue === 'all' || (p.venue || '').toLowerCase().includes(selectedVenue.toLowerCase());
      return matchSearch && matchVenue;
    });
  }, [papers, searchQuery, selectedVenue]);

  // Unique venues
  const venues = useMemo(() => {
    const vSet = new Set(papers.map((p) => p.venue).filter(Boolean));
    return Array.from(vSet) as string[];
  }, [papers]);

  const handleCopyBibtex = (p: PaperEntity) => {
    const bibtex = `@article{${p.authors[0]?.split(' ')[0]?.toLowerCase() || 'auth'}${p.year || 2026},
  title={${p.title}},
  author={${p.authors.join(' and ')}},
  journal={${p.venue || 'Proceedings'}},
  year={${p.year || 2026}},
  doi={${p.doi || 'N/A'}}
}`;
    navigator.clipboard.writeText(bibtex);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAllBibtex = () => {
    const allBib = papers
      .map(
        (p) => `@article{${p.authors[0]?.split(' ')[0]?.toLowerCase() || 'auth'}${p.year || 2026},
  title={${p.title}},
  author={${p.authors.join(' and ')}},
  journal={${p.venue || 'Proceedings'}},
  year={${p.year || 2026}},
  doi={${p.doi || 'N/A'}},
  url={${p.url || ''}}
}`
      )
      .join('\n\n');

    const blob = new Blob([allBib], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workspace_references.bib';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Mock metadata lookup for DOI / arXiv
  const handleFetchMetadata = () => {
    if (!importInput.trim()) return;
    setIsFetchingMetadata(true);

    setTimeout(() => {
      let mockResult: Partial<PaperEntity>;
      const input = importInput.trim();

      if (importMode === 'arxiv' || input.includes('arxiv') || input.match(/^\d{4}\.\d{4,5}/)) {
        mockResult = {
          title: 'Scaling Efficient Epistemic Attention for High-Throughput Edge Reasoning',
          authors: ['T. Chen', 'S. Gupta', 'A. Vaswani'],
          year: 2026,
          venue: 'arXiv:2602.14890 [cs.LG]',
          doi: '10.48550/arXiv.2602.14890',
          url: `https://arxiv.org/abs/${input.replace('https://arxiv.org/abs/', '')}`,
          abstract:
            'We investigate sparse key-value cache pruning and memory-bounded layer execution. By dynamically truncating low-information activation heads, we reduce DRAM bandwidth demand by 44% with sub-0.2% perplexity loss.',
        };
      } else if (importMode === 'doi' || input.includes('10.')) {
        mockResult = {
          title: 'Asymmetric Quantization and Low-Rank Spatial Distillation for Embedded Inference',
          authors: ['M. Dao', 'R. Brooks', 'E. Vance'],
          year: 2025,
          venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)',
          doi: input,
          url: `https://doi.org/${input.replace('https://doi.org/', '')}`,
          abstract:
            'Real-time edge perception requires strict adherence to sub-watt thermal envelopes. We introduce a layer folding operator with non-uniform weight clamping that achieves Pareto-optimal throughput across heterogeneous accelerators.',
        };
      } else {
        mockResult = {
          title: 'Automated Scientific Discovery via Epistemic Research Graphs',
          authors: ['J. Kowalski', 'L. Zhang', 'D. Patel'],
          year: 2026,
          venue: 'Nature Machine Intelligence',
          doi: '10.1038/s42256-026-00412-x',
          url: 'https://doi.org/10.1038/s42256-026-00412-x',
          abstract:
            'Connecting empirical experimental artifacts directly to theoretical hypotheses closes the research reproducibility gap, boosting scientific validation confidence across multi-institutional teams.',
        };
      }

      setImportedPreview(mockResult);
      setIsFetchingMetadata(false);
    }, 700);
  };

  const handleConfirmImport = () => {
    if (!importedPreview || !importedPreview.title) return;
    const nextCode = `P-${String(papers.length + 1).padStart(3, '0')}`;
    addEntity({
      id: `p-${Date.now()}`,
      code: nextCode,
      type: 'paper',
      title: importedPreview.title || 'Untitled Research Paper',
      authors: importedPreview.authors || ['Anonymous Author'],
      year: importedPreview.year || new Date().getFullYear(),
      venue: importedPreview.venue || 'Conference Proceedings',
      abstract: importedPreview.abstract || '',
      doi: importedPreview.doi || '',
      url: importedPreview.url || '',
      createdAt: new Date().toISOString(),
    });

    setIsImportModalOpen(false);
    setImportedPreview(null);
    setImportInput('');
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <BookOpen className="h-3.5 w-3.5" />
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                Literature & Scientific Evidence Hub
              </h1>
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400">
                {papers.length} Papers Grounded
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Manage reference citations, extract findings, and link prior literature directly to research gaps, hypotheses, and claims.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Export BibTeX */}
            <button
              onClick={handleExportAllBibtex}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Export .bib</span>
            </button>

            {/* Import / Add Paper */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Import Paper</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search literature by title, author, keyword, or abstract..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Venues & Journals ({venues.length})</option>
              {venues.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Literature Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredPapers.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-8 text-center">
            <BookMarked className="h-10 w-10 text-slate-600 mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No papers found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              No literature matches your current search or filter criteria. Import papers using DOI or arXiv ID.
            </p>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
            >
              Import Reference
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPapers.map((paper) => {
              // Find connected relationships
              const connectedRels = relationships.filter(
                (r) => r.sourceId === paper.id || r.targetId === paper.id
              );

              return (
                <div
                  key={paper.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-5 hover:border-slate-700 transition group shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Header Code & Venue */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-400">
                        {paper.code}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                        {paper.venue} ({paper.year})
                      </span>
                    </div>

                    {/* Paper Title */}
                    <h3 className="text-sm font-bold text-slate-100 leading-snug group-hover:text-blue-300 transition">
                      {paper.title}
                    </h3>

                    {/* Authors */}
                    <div className="text-xs text-slate-400 font-medium">
                      {paper.authors.join(', ')}
                    </div>

                    {/* Abstract preview */}
                    {paper.abstract && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        {paper.abstract}
                      </p>
                    )}

                    {/* Grounded Graph Connections */}
                    <div className="pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        <span>Connected Graph Entities ({connectedRels.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {connectedRels.slice(0, 3).map((rel) => (
                          <span
                            key={rel.id}
                            className="rounded bg-slate-800/80 text-slate-300 border border-slate-700/60 px-1.5 py-0.5 text-[9px] font-mono"
                          >
                            {rel.relationType}
                          </span>
                        ))}
                        {connectedRels.length === 0 && (
                          <span className="text-[10px] text-slate-500 italic">No direct links yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {paper.url && (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>PDF / Source</span>
                        </a>
                      )}
                      {paper.doi && (
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[100px]">
                          {paper.doi}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyBibtex(paper)}
                        title="Copy BibTeX"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition cursor-pointer"
                      >
                        {copiedId === paper.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          selectEntity(paper.id, 'paper');
                          setViewMode('canvas');
                        }}
                        title="Locate on Spatial Canvas"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition cursor-pointer"
                      >
                        <Layers className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => deleteEntity(paper.id, 'paper')}
                        title="Remove Paper"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <BookmarkPlus className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Import Scientific Literature</h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportedPreview(null);
                }}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Mode selection tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setImportMode('doi');
                  setImportedPreview(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  importMode === 'doi' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DOI Lookup
              </button>
              <button
                onClick={() => {
                  setImportMode('arxiv');
                  setImportedPreview(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  importMode === 'arxiv' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                arXiv ID / URL
              </button>
              <button
                onClick={() => {
                  setImportMode('bibtex');
                  setImportedPreview(null);
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  importMode === 'bibtex' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                BibTeX
              </button>
            </div>

            {/* Input field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                {importMode === 'doi' && 'Enter DOI (e.g. 10.1145/3543873 or https://doi.org/...)'}
                {importMode === 'arxiv' && 'Enter arXiv ID or URL (e.g. 2602.14890 or https://arxiv.org/abs/...)'}
                {importMode === 'bibtex' && 'Paste BibTeX Snippet'}
              </label>

              {importMode === 'bibtex' ? (
                <textarea
                  rows={4}
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="@article{...}"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={importInput}
                    onChange={(e) => setImportInput(e.target.value)}
                    placeholder={importMode === 'doi' ? '10.1145/3543873' : '2602.14890'}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handleFetchMetadata}
                    disabled={isFetchingMetadata || !importInput.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    {isFetchingMetadata ? (
                      <span className="inline-block animate-spin">⟳</span>
                    ) : (
                      <Search className="h-3.5 w-3.5" />
                    )}
                    <span>Fetch</span>
                  </button>
                </div>
              )}
            </div>

            {/* Imported metadata preview */}
            {importedPreview && (
              <div className="rounded-xl bg-slate-950 p-4 border border-blue-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between text-blue-400 font-bold">
                  <span>Metadata Retrieved</span>
                  <span className="text-[10px] font-mono text-slate-400">{importedPreview.venue}</span>
                </div>
                <div className="font-bold text-slate-100">{importedPreview.title}</div>
                <div className="text-slate-400">Authors: {importedPreview.authors?.join(', ')}</div>
                {importedPreview.abstract && (
                  <div className="text-slate-400 text-[11px] line-clamp-2 italic">
                    "{importedPreview.abstract}"
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportedPreview(null);
                }}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={!importedPreview}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
              >
                Add to Research Corpus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
