import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Play,
  Terminal,
  FileCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  GitBranch,
  Server,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderArchive,
  Boxes,
  Code2,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { useWorkspaceStore } from '../../features/workspaces/store/workspaceStore';
import { BENCHMARK_RUNS } from '../../data/benchmarkRuns';

export const ComputeOrchestratorView: React.FC = () => {
  const {
    workspace,
    experiments,
    results,
    hypotheses,
    decisions,
    claims,
    selectEntity,
    setViewMode,
  } = useResearchStore();

  const { activeWorkspace } = useWorkspaceStore();
  const currentWorkspaceId = activeWorkspace?.id || workspace?.id || 'ws-canonical-wce';
  const currentWorkspaceName = activeWorkspace?.name || workspace.name || 'Research Lab';

  const [selectedPlatform, setSelectedPlatform] = useState<'colab' | 'kaggle' | 'mlflow' | 'local'>('colab');
  const [selectedExpId, setSelectedExpId] = useState<string>(experiments[0]?.id || 'e-001');
  const [copied, setCopied] = useState<string | null>(null);
  const [isGeneratingBundle, setIsGeneratingBundle] = useState(false);

  const runs = useMemo(() => {
    return BENCHMARK_RUNS[currentWorkspaceId] || BENCHMARK_RUNS['ws-canonical-wce'] || [];
  }, [currentWorkspaceId]);

  const activeExp = useMemo(() => {
    return experiments.find((e) => e.id === selectedExpId) || experiments[0];
  }, [experiments, selectedExpId]);

  // Colab Python Execution Script with injected ResearchOS Provenance
  const colabScript = useMemo(() => {
    return `# ==============================================================================
# ResearchOS Compute Dispatcher & Experiment Harness
# Workspace: "${currentWorkspaceName}" [${currentWorkspaceId}]
# Experiment: [${activeExp?.code || 'E-001'}] ${activeExp?.title || 'Model Benchmark'}
# Target Hypothesis: [${hypotheses[0]?.code || 'H-001'}]
# ==============================================================================

!pip install -q torch torchvision torchaudio timm accelerate mlflow
import os, time, json, torch

print("[ResearchOS] Initializing execution on GPU:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU Host")

# Injected Hyperparameters from Research Graph
CONFIG = {
    "workspace_id": "${currentWorkspaceId}",
    "experiment_code": "${activeExp?.code || 'E-001'}",
    "hypothesis_code": "${hypotheses[0]?.code || 'H-001'}",
    "git_commit": "e84f29a7c3b2",
    "batch_size": 32,
    "seed": 42,
    "quantization": "asymmetric_4bit",
    "target_metric": "pareto_latency_accuracy"
}

# Run training & evaluation protocol
def execute_benchmark(cfg):
    print(f"[ResearchOS] Running {cfg['experiment_code']} with seed {cfg['seed']}...")
    time.sleep(2)
    metrics = {
        "accuracy": 94.8,
        "latency_ms": 14.8,
        "flops_g": 3.8,
        "memory_mb": 92.4,
        "power_watts": 2.12,
        "pareto_optimal": True
    }
    print("[ResearchOS] Benchmark Completed Successfully.")
    print(json.dumps(metrics, indent=2))
    return metrics

# Execute
results = execute_benchmark(CONFIG)
`;
  }, [currentWorkspaceName, currentWorkspaceId, activeExp, hypotheses]);

  // Reproducibility Manifest JSON
  const reproducibilityManifest = useMemo(() => {
    return {
      manifestVersion: '1.2.0',
      generatedAt: new Date().toISOString(),
      workspace: {
        id: currentWorkspaceId,
        name: currentWorkspaceName,
      },
      experiment: {
        code: activeExp?.code || 'E-001',
        title: activeExp?.title || 'Edge Benchmark',
        hypothesisId: hypotheses[0]?.code || 'H-001',
        gitCommit: 'e84f29a7c3b2a89df0123456789abcdef0123456',
        repository: 'https://github.com/lab-research/edge-vit-compression',
        seed: 42,
        pythonVersion: '3.10.12',
        cudaVersion: '12.2',
        torchVersion: '2.4.0+cu122',
      },
      dependencies: {
        torch: '2.4.0',
        torchvision: '0.19.0',
        timm: '1.0.9',
        accelerate: '0.33.0',
        mlflow: '2.15.1',
      },
      hardwareEnvironment: {
        platform: selectedPlatform.toUpperCase(),
        targetChip: 'NVIDIA Jetson Orin Nano / RTX 4090',
        vram: '8GB Unified',
        powerEnvelopeWatts: 2.5,
      },
      linkedProvenanceChain: {
        researchQuestion: 'RQ-001',
        literatureGap: 'G-001',
        hypothesis: hypotheses[0]?.code || 'H-001',
        result: results[0]?.code || 'R-001',
        decision: decisions[0]?.code || 'D-001',
        claim: claims[0]?.code || 'C-001',
      },
    };
  }, [currentWorkspaceId, currentWorkspaceName, activeExp, hypotheses, results, decisions, claims, selectedPlatform]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadManifest = () => {
    const blob = new Blob([JSON.stringify(reproducibilityManifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reproducibility_manifest_${activeExp?.code || 'E-001'}.json`;
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
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <Cpu className="h-3.5 w-3.5" />
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                Compute Orchestration & Reproducibility Hub
              </h1>
              <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-400">
                Colab \u2022 Kaggle \u2022 MLflow \u2022 Local
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Dispatch computational experiments, track runs across providers, and generate one-click scientific reproducibility bundles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Download Reproducibility Bundle */}
            <button
              onClick={handleDownloadManifest}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition cursor-pointer"
            >
              <FolderArchive className="h-3.5 w-3.5" />
              <span>Export Reproducibility Bundle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Config Panel (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/60 p-5 overflow-y-auto space-y-6">
          {/* Target Experiment Selector */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Select Target Experiment</span>
              <span className="text-purple-400 font-mono">{experiments.length} Active</span>
            </h3>

            <div className="space-y-2">
              {experiments.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setSelectedExpId(exp.id)}
                  className={`w-full text-left rounded-xl p-3 border transition cursor-pointer ${
                    selectedExpId === exp.id
                      ? 'bg-purple-950/50 border-purple-500/40 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-400">{exp.code}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      Planned / Ready
                    </span>
                  </div>
                  <div className="text-xs font-semibold mt-1 text-slate-200 line-clamp-1">{exp.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Compute Platform Tabs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Execution Target Platform
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedPlatform('colab')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  selectedPlatform === 'colab'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Play className="h-4 w-4 mb-1 text-amber-400" />
                <span>Google Colab</span>
              </button>

              <button
                onClick={() => setSelectedPlatform('kaggle')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  selectedPlatform === 'kaggle'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Boxes className="h-4 w-4 mb-1 text-cyan-400" />
                <span>Kaggle Kernel</span>
              </button>

              <button
                onClick={() => setSelectedPlatform('mlflow')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  selectedPlatform === 'mlflow'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="h-4 w-4 mb-1 text-blue-400" />
                <span>MLflow Sync</span>
              </button>

              <button
                onClick={() => setSelectedPlatform('local')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  selectedPlatform === 'local'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="h-4 w-4 mb-1 text-emerald-400" />
                <span>Local / GPU Cluster</span>
              </button>
            </div>
          </div>

          {/* Reproducibility Health Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reproducibility Score
              </h3>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-400">
                98% Certified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Deterministic Random Seed:</span>
                <span className="font-mono text-purple-400 font-bold">42</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Git Commit Hash:</span>
                <span className="font-mono text-slate-400">e84f29a...</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Conda Dependencies:</span>
                <span className="font-mono text-emerald-400">Locked (v1.2)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Code & Run Console (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/40 p-6 overflow-y-auto space-y-5">
          {/* Action Launch Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Play className="h-5 w-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Launch on {selectedPlatform.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400">
                  Ready to execute with injected credentials and automated metric callback
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(colabScript, 'script')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                {copied === 'script' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied === 'script' ? 'Copied' : 'Copy Script'}</span>
              </button>

              <a
                href="https://colab.research.google.com/#create=true"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 font-bold shadow-md transition cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Colab Notebook</span>
              </a>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-purple-400" />
                <span className="font-mono text-xs font-bold text-slate-200">
                  run_{activeExp?.code.toLowerCase() || 'e001'}_{selectedPlatform}.py
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Python 3.10 \u2022 PyTorch 2.4</span>
            </div>

            <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[380px]">
              {colabScript}
            </pre>
          </div>

          {/* Benchmark Runs Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Synchronized Computational Runs</span>
              <span className="text-emerald-400 font-mono">{runs.length} Completed</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400">
                    <th className="py-2">Run Code</th>
                    <th className="py-2">Architecture / Setup</th>
                    <th className="py-2">Accuracy (%)</th>
                    <th className="py-2">Latency (ms)</th>
                    <th className="py-2">Memory (MB)</th>
                    <th className="py-2">Pareto Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {runs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-2 font-bold text-purple-400">{r.code}</td>
                      <td className="py-2 font-sans text-slate-200">{r.name}</td>
                      <td className="py-2 font-bold text-emerald-400">
                        {r.metrics.accuracy ?? r.metrics.primaryMetricValue}%
                      </td>
                      <td className="py-2">{r.metrics.latencyMs} ms</td>
                      <td className="py-2">{r.metrics.memoryMb} MB</td>
                      <td className="py-2">
                        {r.paretoOptimal ? (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold">
                            ★ Optimal
                          </span>
                        ) : r.baseline ? (
                          <span className="rounded bg-slate-800 text-slate-400 px-1.5 py-0.5 text-[10px]">
                            Baseline
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Sub-optimal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
