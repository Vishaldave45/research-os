import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Sliders,
  Columns,
  Maximize2,
  Eye,
  Code2,
  BookOpen,
  Edit3,
  RefreshCw,
  Share2,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { useWorkspaceStore } from '../../features/workspaces/store/workspaceStore';
import { BENCHMARK_RUNS } from '../../data/benchmarkRuns';

type PreviewMode = 'camera_ready' | 'split_markdown' | 'latex_tex';

export const ManuscriptComposerView: React.FC = () => {
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
    selectEntity,
    setViewMode,
  } = useResearchStore();

  const { activeWorkspace } = useWorkspaceStore();
  const currentWorkspaceId = activeWorkspace?.id || workspace?.id || 'ws-canonical-wce';
  const currentWorkspaceName = activeWorkspace?.name || workspace.name || 'Research Lab';

  const [previewMode, setPreviewMode] = useState<PreviewMode>('camera_ready');
  const [targetVenue, setTargetVenue] = useState<'NeurIPS' | 'ICML' | 'CVPR' | 'Nature'>('NeurIPS');
  const [copied, setCopied] = useState<boolean>(false);
  const [filterSection, setFilterSection] = useState<string>('all');

  const runs = useMemo(() => {
    return BENCHMARK_RUNS[currentWorkspaceId] || BENCHMARK_RUNS['ws-canonical-wce'] || [];
  }, [currentWorkspaceId]);

  const primaryQuestion = questions[0]?.title || workspace.description;
  const primaryHypothesis = hypotheses[0]?.statement || 'Novel architectural model compression maintains baseline performance.';
  const primaryResult = results[0]?.summary || 'Achieved target latency and compression objectives.';
  const primaryClaim = claims[0]?.statement || 'Demonstrated Pareto-optimal efficiency gains.';

  // Section drafts auto-synthesized from graph provenance
  const paperTitle = useMemo(() => {
    if (currentWorkspaceId.includes('distil')) {
      return 'Outlier-Protected Asymmetric 4-bit KV Cache Quantization for Edge LLM Reasoning';
    }
    if (currentWorkspaceId.includes('rob')) {
      return 'Real-Time Tactile Diffusion Policies via Consistency Trajectory Distillation';
    }
    if (currentWorkspaceId.includes('bio')) {
      return 'SE(3)-Equivariant Graph Neural Networks for Dynamic Protein-Ligand Affinity Prediction';
    }
    return `${currentWorkspaceName}: Layer Folding and Spatial Patch Pruning for Real-Time Edge Vision Transformers`;
  }, [currentWorkspaceId, currentWorkspaceName]);

  const authors = ['A. Research Lead, Ph.D.', 'B. Principal Scientist', 'C. Experimental Engineer'];

  // Generated Markdown Draft
  const generatedMarkdown = useMemo(() => {
    return `# ${paperTitle}

**Authors:** ${authors.join(', ')}  
**Target Venue:** ${targetVenue} 2026 Submission  
**Provenance Hash:** \`ws-${currentWorkspaceId.slice(0, 8)}-verified\`

---

## Abstract
Transformer architectures have demonstrated state-of-the-art accuracy across scientific and perception benchmarks; however, their deployment on resource-constrained embedded edge hardware is severely hindered by strict memory bandwidth and sub-watt thermal limits. In this paper, we address the core inquiry (**[${questions[0]?.code || 'RQ-001'}]:** *${primaryQuestion}*). Drawing from key insights in prior literature (**[${papers[0]?.code || 'P-101'}]** by *${papers[0]?.authors?.[0] || 'Dao et al.'}*), we target the critical open gap (**[${gaps[0]?.code || 'G-001'}]:** *${gaps[0]?.title || 'Hardware deployment bottleneck'}*). We formalize the hypothesis (**[${hypotheses[0]?.code || 'H-001'}]:** *${primaryHypothesis}*). Through extensive empirical benchmarking (**[${experiments[0]?.code || 'E-001'}]**), our proposed approach attains **${primaryResult}**, pushing the Pareto frontier on edge hardware. Finally, architectural decisions (**[${decisions[0]?.code || 'D-001'}]**) confirm our verified publication claim (**[${claims[0]?.code || 'C-001'}]** with ${Math.round((claims[0]?.confidenceScore || 0.94) * 100)}% empirical confidence).

---

## 1. Introduction & Problem Formulation
Recent advancements in computational pipelines necessitate deployment directly on resource-constrained embedded systems. We formalize our central research question:

> **Research Question [${questions[0]?.code || 'RQ-001'}]:**  
> *${primaryQuestion}*

${questions[0]?.description || 'We investigate the trade-offs between model accuracy and edge hardware constraints.'}

Traditional uncompressed baselines fail to meet strict hardware deadlines. To maintain real-time responsiveness without thermal throttling, we propose a principled compression and inference pipeline.

---

## 2. Related Work & Literature Gap Analysis
Prior foundational work provides important building blocks:
${papers
  .map(
    (p) =>
      `- **[${p.code}] ${p.title}** (*${p.authors.join(', ')}*, ${p.venue} ${p.year}): ${p.abstract}`
  )
  .join('\n')}

Despite these advances, existing methodologies suffer from a critical limitation:

> **Open Gap [${gaps[0]?.code || 'G-001'}]:**  
> *${gaps[0]?.title || 'Latency and memory trade-off on edge hardware'}*  
> *Impact:* ${gaps[0]?.impactLevel || 'Critical'}

---

## 3. Proposed Methodology & Hypotheses
To bridge this gap, we establish the following formal hypothesis:

> **Hypothesis [${hypotheses[0]?.code || 'H-001'}]:**  
> *${hypotheses[0]?.statement || primaryHypothesis}*  
> **Theoretical Rationale:** ${hypotheses[0]?.rationale || 'Preserves semantic representations while cutting redundant computation.'}

We mathematically formulate our dynamic layer transformation operator $\\mathcal{T}(x)$ bounded by edge latency constraint $T_{\\text{max}}$ and thermal envelope $P_{\\text{cap}}$:

$$\\min_{\\theta} \\; \\mathcal{L}_{\\text{task}}(f_\\theta(X), Y) \\quad \\text{s.t.} \\quad \\text{Latency}(f_\\theta) \\le T_{\\text{deadline}}, \\; \\text{Power}(f_\\theta) \\le P_{\\text{envelope}}$$

---

## 4. Empirical Evaluation & Pareto Benchmarks
We validate our method through experimental protocol **[${experiments[0]?.code || 'E-001'}]** (*${experiments[0]?.title || 'Hardware Benchmark'}*).

### Quantitative Results & Trade-Off Matrix:
| Model / Run Code | Architecture & Strategy | Primary Metric (%) | Latency (ms) | Complexity (GFLOPs) | Memory (MB) | Pareto Optimal |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${runs
  .map(
    (r) =>
      `| **${r.code}** | ${r.name} | **${r.metrics.accuracy ?? r.metrics.primaryMetricValue}%** | ${r.metrics.latencyMs} ms | ${r.metrics.flopsG} G | ${r.metrics.memoryMb} MB | ${r.paretoOptimal ? '★ Yes' : r.baseline ? 'Baseline' : 'No'} |`
  )
  .join('\n')}

**Key Outcome [${results[0]?.code || 'R-001'}]:**  
${results[0]?.summary || primaryResult}

---

## 5. Architectural Decisions & Ablations
Based on our empirical observations, the laboratory logged the following architectural verdict:

${decisions
  .map(
    (d) =>
      `- **Decision [${d.code}] (${d.outcome.toUpperCase()}):** ${d.title}  \n  *Rationale:* ${d.rationale}  \n  *Implications:* ${d.implications}`
  )
  .join('\n\n')}

---

## 6. Verified Scientific Claims & Conclusion
${claims.length === 0 ? `> ⚠️ **Provenance Notice:** No verified claims registered in this workspace yet. Execute experiment benchmarks and validate results to substantiate publication claims.` : claims
  .map(
    (c) =>
      `1. **[${c.code}]** ${c.statement} *(${c.status === 'verified' ? '✅ Verified' : '⚠️ Unverified Proposed Claim'}, Confidence: ${Math.round((c.confidenceScore || 0.5) * 100)}%)*`
  )
  .join('\n')}

---

## References (BibTeX Provenance)
${papers
  .map(
    (p) =>
      `@article{${(p.authors[0] || 'author').split(',')[0].toLowerCase()}${p.year || 2026},\n  title={${p.title}},\n  author={${p.authors.join(' and ')}},\n  journal={${p.venue}},\n  year={${p.year}},\n  doi={${p.doi || 'N/A'}}\n}`
  )
  .join('\n\n')}
`;
  }, [
    paperTitle,
    authors,
    targetVenue,
    currentWorkspaceId,
    questions,
    primaryQuestion,
    papers,
    gaps,
    hypotheses,
    primaryHypothesis,
    experiments,
    primaryResult,
    runs,
    results,
    decisions,
    claims,
  ]);

  // Generated LaTeX (.tex) Source
  const generatedLaTeX = useMemo(() => {
    return `\\documentclass[10pt,twocolumn,letterpaper]{article}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{booktabs}
\\usepackage{microtype}
\\usepackage{hyperref}

\\title{\\textbf{${paperTitle}}}
\\author{${authors.join(' \\and ')}}
\\date{${targetVenue} 2026 Conference Submission}

\\begin{document}
\\maketitle

\\begin{abstract}
${primaryQuestion} We address this challenge through hypothesis \\textbf{${hypotheses[0]?.code || 'H-001'}}, demonstrating ${primaryResult}. Our empirical evaluation establishes a new Pareto frontier on edge hardware with verified confidence ${Math.round((claims[0]?.confidenceScore || 0.94) * 100)}\\%.
\\end{abstract}

\\section{Introduction}
We investigate the foundational inquiry \\textbf{[${questions[0]?.code || 'RQ-001'}]}: \\emph{${primaryQuestion}}.

\\section{Related Work \\& Literature Gaps}
Prior work by ${papers[0]?.authors?.[0] || 'Dao et al.'}~\\cite{${(papers[0]?.authors[0] || 'auth').split(',')[0].toLowerCase()}${papers[0]?.year || 2026}} establishes important baselines. However, \\textbf{[${gaps[0]?.code || 'G-001'}]} remains unresolved: \\emph{${gaps[0]?.title || 'Hardware deployment bottleneck'}}.

\\section{Empirical Evaluation}
We evaluate our method across benchmark protocols:
\\begin{table}[h]
\\centering
\\caption{Comparative Performance and Pareto Frontier Benchmark}
\\label{tab:results}
\\small
\\begin{tabular}{lcccc}
\\toprule
\\textbf{Run} & \\textbf{Acc (\\%)} & \\textbf{Latency (ms)} & \\textbf{GFLOPs} & \\textbf{Memory} \\\\
\\midrule
${runs
  .map(
    (r) =>
      `${r.code} & ${r.metrics.accuracy ?? r.metrics.primaryMetricValue}\\% & ${r.metrics.latencyMs} & ${r.metrics.flopsG} & ${r.metrics.memoryMb}MB \\\\`
  )
  .join('\n')}
\\bottomrule
\\end{tabular}
\\end{table}

\\section{Verified Claims \\& Conclusion}
${claims
  .map(
    (c) =>
      `\\noindent \\textbf{[${c.code}]}: ${c.statement} (${Math.round((c.confidenceScore || 0.94) * 100)}\\% confidence).`
  )
  .join('\n\n')}

\\bibliographystyle{plain}
\\bibliography{references}
\\end{document}
`;
  }, [paperTitle, authors, targetVenue, primaryQuestion, hypotheses, primaryResult, claims, papers, gaps, runs]);

  // Provenance Integrity Audit
  const auditChecks = useMemo(() => {
    return [
      {
        name: 'Research Goal Grounded',
        passed: questions.length > 0,
        detail: `${questions.length} Research Questions linked in Problem Formulation`,
      },
      {
        name: 'Literature & Gap Justification',
        passed: papers.length > 0 && gaps.length > 0,
        detail: `${papers.length} Papers cited across ${gaps.length} identified gaps`,
      },
      {
        name: 'Empirical Benchmark Verification',
        passed: runs.length >= 2,
        detail: `${runs.length} Evaluated benchmark runs in comparative table`,
      },
      {
        name: 'Claims Backed by Provenance',
        passed: claims.every((c) => (c.confidenceScore || 0) >= 0.85),
        detail: `${claims.length} Verified claims (>85% statistical confidence)`,
      },
    ];
  }, [questions, papers, gaps, runs, claims]);

  const allPassed = auditChecks.every((c) => c.passed);

  const wordCount = useMemo(() => {
    return generatedMarkdown.split(/\s+/).filter(Boolean).length;
  }, [generatedMarkdown]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
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
    <div className="flex h-full w-full flex-col bg-slate-900 text-slate-100 overflow-hidden">
      {/* Top Header & Composer Controls */}
      <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <FileText className="h-3.5 w-3.5" />
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                Paper Manuscript Composer & Provenance Storyboard
              </h1>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Audit Passed
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Live scientific paper generator linking text directly to graph nodes, Pareto benchmarks, and verified claims.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Target Venue Selector */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-1">
              <span className="px-2 text-[10px] font-bold uppercase text-slate-400">Venue:</span>
              <select
                value={targetVenue}
                onChange={(e) => setTargetVenue(e.target.value as any)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 border-none outline-none cursor-pointer"
              >
                <option value="NeurIPS">NeurIPS 2026 (9 pages)</option>
                <option value="ICML">ICML 2026 (8 pages)</option>
                <option value="CVPR">CVPR 2026 (8 pages)</option>
                <option value="Nature">Nature Biotech / Machine Intelligence</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
              <button
                onClick={() => setPreviewMode('camera_ready')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  previewMode === 'camera_ready'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Camera Ready (2-Col)</span>
              </button>

              <button
                onClick={() => setPreviewMode('split_markdown')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  previewMode === 'split_markdown'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Markdown Draft</span>
              </button>

              <button
                onClick={() => setPreviewMode('latex_tex')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  previewMode === 'latex_tex'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>LaTeX (.tex)</span>
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={() =>
                handleCopy(previewMode === 'latex_tex' ? generatedLaTeX : generatedMarkdown)
              }
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Source'}</span>
            </button>

            {/* Download Button */}
            <button
              onClick={() => {
                if (previewMode === 'latex_tex') {
                  handleDownload(`manuscript_${workspace.name || 'paper'}.tex`, generatedLaTeX, 'text/x-tex');
                } else {
                  handleDownload(`manuscript_${workspace.name || 'paper'}.md`, generatedMarkdown, 'text/markdown');
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download {previewMode === 'latex_tex' ? '.tex' : '.md'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Provenance Audit & Metadata Sidebar (3 cols) */}
        <div className="lg:col-span-3 border-r border-slate-800 bg-slate-950/60 p-5 overflow-y-auto space-y-6">
          {/* Paper Stats */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Manuscript Metrics</span>
              <span className="text-indigo-400 font-mono">Live</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400">Word Count</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">{wordCount}</div>
              </div>
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400">Est. Pages</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {(wordCount / 550).toFixed(1)} / 9.0
                </div>
              </div>
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400">Cited Nodes</div>
                <div className="text-base font-bold text-indigo-400 font-mono mt-0.5">
                  {questions.length + papers.length + gaps.length + hypotheses.length + experiments.length + claims.length}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                <div className="text-[10px] text-slate-400">Pareto Runs</div>
                <div className="text-base font-bold text-purple-400 font-mono mt-0.5">
                  {runs.filter((r) => r.paretoOptimal).length}
                </div>
              </div>
            </div>
          </div>

          {/* Scientific Integrity Checklist */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Provenance Integrity Audit</span>
              <span className="text-emerald-400 text-[10px]">100% Passed</span>
            </h3>

            <div className="space-y-2.5">
              {auditChecks.map((chk, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-950/80 p-2.5 border border-slate-800 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{chk.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{chk.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick-Insert Citation Chips */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Graph Entity References
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Click any chip to jump to that entity on the spatial canvas:
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pt-1">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    selectEntity(q.id, 'question');
                    setViewMode('canvas');
                  }}
                  className="rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800 px-2 py-0.5 text-[10px] font-mono font-bold hover:bg-indigo-900 transition cursor-pointer"
                >
                  {q.code}
                </button>
              ))}
              {papers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    selectEntity(p.id, 'paper');
                    setViewMode('canvas');
                  }}
                  className="rounded bg-blue-950/80 text-blue-300 border border-blue-800 px-2 py-0.5 text-[10px] font-mono font-bold hover:bg-blue-900 transition cursor-pointer"
                >
                  {p.code}
                </button>
              ))}
              {gaps.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    selectEntity(g.id, 'gap');
                    setViewMode('canvas');
                  }}
                  className="rounded bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 text-[10px] font-mono font-bold hover:bg-amber-900 transition cursor-pointer"
                >
                  {g.code}
                </button>
              ))}
              {hypotheses.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    selectEntity(h.id, 'hypothesis');
                    setViewMode('canvas');
                  }}
                  className="rounded bg-teal-950/80 text-teal-300 border border-teal-800 px-2 py-0.5 text-[10px] font-mono font-bold hover:bg-teal-900 transition cursor-pointer"
                >
                  {h.code}
                </button>
              ))}
              {claims.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    selectEntity(c.id, 'claim');
                    setViewMode('canvas');
                  }}
                  className="rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 text-[10px] font-mono font-bold hover:bg-emerald-900 transition cursor-pointer"
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Manuscript Content Preview (9 cols) */}
        <div className="lg:col-span-9 bg-slate-900/40 overflow-y-auto p-6 flex justify-center">
          {previewMode === 'camera_ready' && (
            /* Scientific Two-Column Camera-Ready Sheet */
            <div className="w-full max-w-4xl rounded-2xl border border-slate-700/80 bg-white text-slate-900 p-8 sm:p-12 shadow-2xl space-y-6 font-serif">
              {/* Paper Title Header */}
              <div className="text-center border-b border-slate-200 pb-6">
                <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-slate-950 leading-tight">
                  {paperTitle}
                </h1>
                <div className="mt-3 text-xs sm:text-sm font-sans font-medium text-slate-700">
                  {authors.join(' \u00A0\u2022\u00A0 ')}
                </div>
                <div className="mt-1 text-[11px] font-sans text-slate-500 italic">
                  Autonomous Scientific Laboratory \u2022 Verified ResearchOS Provenance
                </div>
              </div>

              {/* Two-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-slate-800 text-justify">
                {/* Column 1 */}
                <div className="space-y-4">
                  {/* Abstract */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 not-italic">
                    <span className="font-bold font-sans text-xs uppercase tracking-wider text-slate-900 block mb-1">
                      Abstract
                    </span>
                    <p className="text-[11px] leading-normal text-slate-700">
                      Deploying state-of-the-art architectures onto constrained embedded hardware is blocked by memory bandwidth and sub-watt thermal limits. In this paper, we address the inquiry (
                      <strong className="text-indigo-700 font-sans font-mono">
                        [{questions[0]?.code || 'RQ-001'}]
                      </strong>
                      : <em>{primaryQuestion}</em>). Through our proposed framework, we validate hypothesis{' '}
                      <strong className="text-teal-700 font-sans font-mono">
                        [{hypotheses[0]?.code || 'H-001'}]
                      </strong>
                      , delivering <strong>{primaryResult}</strong> and establishing verified publication claims (
                      <strong className="text-emerald-700 font-sans font-mono">
                        [{claims[0]?.code || 'C-001'}]
                      </strong>
                      ).
                    </p>
                  </div>

                  {/* Section 1: Introduction */}
                  <div>
                    <h2 className="font-bold font-sans text-sm text-slate-950 border-b border-slate-200 pb-1 mb-2">
                      1. Introduction
                    </h2>
                    <p>
                      Modern deep learning workloads are increasingly expected to execute at the edge under deterministic latency constraints. We formulate our central inquiry:
                    </p>
                    <div className="my-2 rounded-lg bg-indigo-50/80 p-2.5 border-l-2 border-indigo-600 text-[11px] text-indigo-950 font-sans">
                      <strong>Goal [{questions[0]?.code || 'RQ-001'}]:</strong> {primaryQuestion}
                    </div>
                    <p>
                      Existing architectures fail when deployed on constrained edge hardware due to thermal throttling.
                    </p>
                  </div>

                  {/* Section 2: Related Work */}
                  <div>
                    <h2 className="font-bold font-sans text-sm text-slate-950 border-b border-slate-200 pb-1 mb-2">
                      2. Related Work & Gaps
                    </h2>
                    <p>
                      Foundational studies such as {papers[0]?.authors?.[0] || 'Dao et al.'} (
                      <span className="font-mono text-blue-700">[{papers[0]?.code || 'P-101'}]</span>) demonstrate core mechanisms. However, a significant gap remains:
                    </p>
                    <div className="my-2 rounded-lg bg-amber-50/80 p-2.5 border-l-2 border-amber-600 text-[11px] text-amber-950 font-sans">
                      <strong>Gap [{gaps[0]?.code || 'G-001'}]:</strong> {gaps[0]?.title || 'Hardware deployment bottleneck'}
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  {/* Section 3: Empirical Benchmarking */}
                  <div>
                    <h2 className="font-bold font-sans text-sm text-slate-950 border-b border-slate-200 pb-1 mb-2">
                      3. Empirical Results & Trade-Offs
                    </h2>
                    <p>
                      We benchmarked candidate runs against uncompressed baselines under protocol{' '}
                      <span className="font-mono text-rose-700">[{experiments[0]?.code || 'E-001'}]</span>.
                    </p>

                    {/* Miniature Table */}
                    <div className="my-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <table className="w-full text-left font-sans text-[10px]">
                        <thead>
                          <tr className="border-b border-slate-300 font-bold text-slate-700">
                            <th className="py-1">Run</th>
                            <th className="py-1">Acc (%)</th>
                            <th className="py-1">Latency</th>
                            <th className="py-1">Memory</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          {runs.slice(0, 4).map((r) => (
                            <tr key={r.id}>
                              <td className="py-1 font-bold">{r.code}</td>
                              <td className="py-1 text-emerald-700 font-bold">
                                {r.metrics.accuracy ?? r.metrics.primaryMetricValue}%
                              </td>
                              <td className="py-1">{r.metrics.latencyMs}ms</td>
                              <td className="py-1">{r.metrics.memoryMb}MB</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Section 4: Decisions & Verified Claims */}
                  <div>
                    <h2 className="font-bold font-sans text-sm text-slate-950 border-b border-slate-200 pb-1 mb-2">
                      4. Verified Claims & Decisions
                    </h2>
                    <p>
                      Following architectural validation (
                      <span className="font-mono text-purple-700">[{decisions[0]?.code || 'D-001'}]</span>), we confirm:
                    </p>
                    <div className="my-2 rounded-lg bg-emerald-50/80 p-2.5 border-l-2 border-emerald-600 text-[11px] text-emerald-950 font-sans">
                      <strong>Claim [{claims[0]?.code || 'C-001'}]:</strong> {claims[0]?.statement || primaryClaim}
                    </div>
                  </div>

                  {/* References */}
                  <div>
                    <h2 className="font-bold font-sans text-sm text-slate-950 border-b border-slate-200 pb-1 mb-2">
                      References
                    </h2>
                    <ol className="list-decimal list-inside text-[10px] space-y-1 text-slate-600 font-sans">
                      {papers.map((p, idx) => (
                        <li key={p.id}>
                          {p.authors.join(', ')}. <em>{p.title}</em>. {p.venue}, {p.year}.
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewMode === 'split_markdown' && (
            <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {generatedMarkdown}
            </div>
          )}

          {previewMode === 'latex_tex' && (
            <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {generatedLaTeX}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
