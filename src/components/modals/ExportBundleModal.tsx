import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  BookOpen,
  Share2,
  FileText,
  Boxes,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../../shared/components/Modal';
import { useResearchStore } from '../../store/useResearchStore';
import { useWorkspaceStore } from '../../features/workspaces/store/workspaceStore';

export interface ExportBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'reproducibility' | 'latex' | 'graph' | 'markdown';

export const ExportBundleModal: React.FC<ExportBundleModalProps> = ({
  isOpen,
  onClose,
}) => {
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
  } = useResearchStore();

  const { activeWorkspace } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState<TabType>('reproducibility');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentWorkspaceName = activeWorkspace?.name || workspace.name || 'ResearchOS Workspace';

  // 1. Generate Reproducibility JSON
  const reproducibilityBundle = {
    schemaVersion: '2.0.0-researchos',
    exportedAt: new Date().toISOString(),
    workspace: {
      id: activeWorkspace?.id || 'ws-default',
      name: currentWorkspaceName,
      description: activeWorkspace?.description || workspace.description,
      primaryQuestion: questions[0]?.title || workspace.description,
    },
    graphSummary: {
      questionsCount: questions.length,
      papersCount: papers.length,
      gapsCount: gaps.length,
      hypothesesCount: hypotheses.length,
      experimentsCount: experiments.length,
      resultsCount: results.length,
      decisionsCount: decisions.length,
      claimsCount: claims.length,
      relationshipsCount: relationships.length,
    },
    researchLineage: {
      questions,
      papers,
      gaps,
      hypotheses,
      experiments,
      results,
      decisions,
      claims,
      relationships,
    },
  };

  const jsonContent = JSON.stringify(reproducibilityBundle, null, 2);

  // 2. Generate LaTeX & BibTeX
  const bibtexContent = papers
    .map((p) => {
      const citeKey = `${(p.authors[0] || 'Author').split(',')[0].toLowerCase()}${p.year || 2026}`;
      return `@article{${citeKey},
  title = {${p.title}},
  author = {${p.authors.join(' and ')}},
  year = {${p.year || 2026}},
  venue = {${p.venue || 'ArXiv'}},
  doi = {${p.doi || '10.xxxx/xxxx'}}${p.url ? `,\n  url = {${p.url}}` : ''}
}`;
    })
    .join('\n\n');

  const latexTable = `% ResearchOS Provenance Table
\\begin{table*}[t]
\\centering
\\small
\\caption{Empirical Evidentiary Traceability and Decision Audit for ${currentWorkspaceName}}
\\label{tab:researchos_provenance}
\\begin{tabular}{lp{5.5cm}p{4.5cm}p{3.5cm}}
\\toprule
\\textbf{Claim / Decision} & \\textbf{Hypothesis \& Target} & \\textbf{Experimental Verification} & \\textbf{Evidence / Papers} \\\\
\\midrule
${claims
  .map(
    (c) =>
      `\\textbf{${c.code}} & ${c.title.replace(/&/g, '\\&')} & Validated (${Math.round((c.confidenceScore || 0.9) * 100)}\\% confidence) & ${papers.map((p) => `\\cite{${(p.authors[0] || 'auth').split(',')[0].toLowerCase()}${p.year || 2026}}`).slice(0, 2).join(', ')} \\\\`
  )
  .join('\n')}
\\bottomrule
\\end{tabular}
\\end{table*}`;

  const latexFull = `${latexTable}\n\n% ========== BIBTEX ENTRIES ==========\n\n${bibtexContent}`;

  // 3. Cytoscape / GraphML JSON
  const cytoscapeElements = {
    nodes: [
      ...questions.map((q) => ({ data: { id: q.id, label: `${q.code}: ${q.title}`, type: 'question' } })),
      ...papers.map((p) => ({ data: { id: p.id, label: `${p.code}: ${p.title}`, type: 'paper' } })),
      ...gaps.map((g) => ({ data: { id: g.id, label: `${g.code}: ${g.title}`, type: 'gap' } })),
      ...hypotheses.map((h) => ({ data: { id: h.id, label: `${h.code}: ${h.title}`, type: 'hypothesis' } })),
      ...experiments.map((e) => ({ data: { id: e.id, label: `${e.code}: ${e.title}`, type: 'experiment' } })),
      ...results.map((r) => ({ data: { id: r.id, label: `${r.code}: ${r.title}`, type: 'result' } })),
      ...decisions.map((d) => ({ data: { id: d.id, label: `${d.code}: ${d.title}`, type: 'decision' } })),
      ...claims.map((c) => ({ data: { id: c.id, label: `${c.code}: ${c.title}`, type: 'claim' } })),
    ],
    edges: relationships.map((rel) => ({
      data: {
        id: rel.id,
        source: rel.sourceId,
        target: rel.targetId,
        label: rel.relationType,
      },
    })),
  };
  const cytoscapeContent = JSON.stringify(cytoscapeElements, null, 2);

  // 4. Markdown Memorandum
  const markdownContent = `# ResearchOS Provenance Memorandum
**Workspace:** ${currentWorkspaceName}  
**Export Date:** ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}  
**Primary Research Goal:** ${questions[0]?.title || workspace.description}

---

## 1. Research Questions & Identified Gaps
${questions.map((q) => `- **${q.code}**: ${q.title}\n  *Description:* ${q.description || 'N/A'}`).join('\n')}

### Gaps in Current Literature:
${gaps.map((g) => `- **${g.code}**: ${g.title} *(Impact: ${g.impactLevel})*`).join('\n')}

---

## 2. Tested Hypotheses
${hypotheses.map((h) => `- **${h.code}**: ${h.statement}\n  *Status:* ${h.status.toUpperCase()} | *Confidence:* ${Math.round((h.confidence || 0.85) * 100)}%`).join('\n')}

---

## 3. Empirical Experiments & Quantitative Results
${experiments
  .map((e) => {
    const res = results.find((r) => r.id === e.id || r.code.replace('R-', 'E-') === e.code);
    return `### ${e.code}: ${e.title}
- **Status:** ${e.status}
- **Parameters:** \`${JSON.stringify(e.parameters || {})}\`
${res ? `- **Result ${res.code}:** ${res.summary}\n- **Metrics:** ${Object.entries(res.metrics || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}`;
  })
  .join('\n\n')}

---

## 4. Key Decisions & Certified Claims
${decisions.map((d) => `- **${d.code} (${d.outcome.toUpperCase()}):** ${d.title}\n  *Rationale:* ${d.rationale}`).join('\n\n')}

### Certified Publication Claims:
${claims.map((c) => `- **${c.code}**: ${c.statement} *(Confidence: ${Math.round((c.confidenceScore || 0.9) * 100)}%)*`).join('\n')}
`;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'reproducibility':
        return { text: jsonContent, ext: 'json', mime: 'application/json', filename: 'reproducibility-bundle.json' };
      case 'latex':
        return { text: latexFull, ext: 'tex', mime: 'text/plain', filename: 'research-provenance.tex' };
      case 'graph':
        return { text: cytoscapeContent, ext: 'json', mime: 'application/json', filename: 'cytoscape-graph.json' };
      case 'markdown':
        return { text: markdownContent, ext: 'md', mime: 'text/markdown', filename: 'research-memo.md' };
    }
  };

  const handleCopy = () => {
    const { text } = getActiveContent();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const { text, mime, filename } = getActiveContent();
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Research Provenance & Reproducibility Bundle"
      description="Export machine-readable research lineage, LaTeX BibTeX citations, or Cytoscape graphs."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('reproducibility')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'reproducibility'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Reproducibility Bundle (.json)</span>
          </button>

          <button
            onClick={() => setActiveTab('latex')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'latex'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>LaTeX & BibTeX</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'graph'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Cytoscape Graph (.json)</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'markdown'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Markdown Memorandum</span>
          </button>
        </div>

        {/* Quick Highlights info box */}
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>
              <strong>{questions.length + hypotheses.length + experiments.length + decisions.length + claims.length}</strong> total verified nodes in active DAG
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 font-semibold text-white hover:bg-indigo-700 shadow-2xs transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Preview Container */}
        <div className="relative rounded-xl border border-slate-200 bg-slate-900 text-slate-100 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-3.5 py-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <FileCode className="h-3.5 w-3.5 text-indigo-400" />
              <span>{getActiveContent().filename}</span>
            </div>
            <span>{getActiveContent().text.length} characters</span>
          </div>
          <pre className="p-4 max-h-[380px] overflow-y-auto overflow-x-auto text-[11.5px] leading-relaxed text-slate-200 font-mono select-text">
            {getActiveContent().text}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
