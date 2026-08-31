import React, { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Cpu,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  RotateCcw,
  Sliders,
  Scale,
  Download,
  Flame,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { useWorkspaceStore } from '../../features/workspaces/store/workspaceStore';
import {
  BENCHMARK_RUNS,
  calculateParetoFrontier,
  computeRunDelta,
} from '../../data/benchmarkRuns';
import { BenchmarkRun } from '../../types/research';

type XAxisMetric = 'latencyMs' | 'flopsG' | 'memoryMb' | 'powerWatts';
type YAxisMetric = 'accuracy' | 'primaryMetricValue' | 'throughputTokensOrFps';

export const BenchmarkStudioView: React.FC = () => {
  const {
    workspace,
    selectEntity,
    openCreateModal,
    experiments,
    hypotheses,
  } = useResearchStore();

  const { activeWorkspace } = useWorkspaceStore();

  const currentWorkspaceId = activeWorkspace?.id || workspace?.id || 'ws-canonical-wce';

  // Get benchmark runs for the current workspace (or fallback)
  const runs: BenchmarkRun[] = useMemo(() => {
    return (
      BENCHMARK_RUNS[currentWorkspaceId] ||
      BENCHMARK_RUNS['ws-canonical-wce'] ||
      []
    );
  }, [currentWorkspaceId]);

  const [selectedRunId, setSelectedRunId] = useState<string>(
    runs.find((r) => r.paretoOptimal)?.id || runs[0]?.id || ''
  );
  const [baselineRunId, setBaselineRunId] = useState<string>(
    runs.find((r) => r.baseline)?.id || runs[0]?.id || ''
  );

  const [xAxisKey, setXAxisKey] = useState<XAxisMetric>('latencyMs');
  const [yAxisKey, setYAxisKey] = useState<YAxisMetric>('accuracy');

  // Interactive hardware constraint filter / threshold
  const [latencyThreshold, setLatencyThreshold] = useState<number>(50); // ms
  const [powerCap, setPowerCap] = useState<number>(2.1); // Watts

  // Computed Pareto Frontier
  const paretoRuns = useMemo(() => {
    return calculateParetoFrontier(runs, xAxisKey, yAxisKey, true, true);
  }, [runs, xAxisKey, yAxisKey]);

  const paretoIds = useMemo(() => new Set(paretoRuns.map((r) => r.id)), [paretoRuns]);

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) || runs[0],
    [runs, selectedRunId]
  );

  const baselineRun = useMemo(
    () => runs.find((r) => r.id === baselineRunId) || runs[0],
    [runs, baselineRunId]
  );

  const delta = useMemo(() => {
    if (!selectedRun || !baselineRun) return null;
    return computeRunDelta(selectedRun, baselineRun);
  }, [selectedRun, baselineRun]);

  // Scatter plot data formatting
  const scatterData = useMemo(() => {
    return runs.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      x: (r.metrics[xAxisKey] as number) || 0,
      y: (r.metrics[yAxisKey] as number) || 0,
      isPareto: paretoIds.has(r.id),
      isBaseline: r.baseline,
      isSelected: r.id === selectedRunId,
      raw: r,
    }));
  }, [runs, xAxisKey, yAxisKey, paretoIds, selectedRunId]);

  const getMetricLabel = (key: string) => {
    switch (key) {
      case 'latencyMs':
        return 'Inference Latency (ms)';
      case 'flopsG':
        return 'Compute Complexity (GFLOPs)';
      case 'memoryMb':
        return 'Memory Footprint (MB VRAM)';
      case 'powerWatts':
        return 'Thermal Power Envelope (Watts)';
      case 'accuracy':
        return runs[0]?.metrics.primaryMetricLabel || 'Model Accuracy (%)';
      case 'primaryMetricValue':
        return 'Primary Metric Score';
      case 'throughputTokensOrFps':
        return 'Throughput (FPS / tok/s)';
      default:
        return key;
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Run Code',
      'Run Name',
      'Git Commit',
      'Baseline',
      'Pareto Optimal',
      'Device',
      getMetricLabel(xAxisKey),
      getMetricLabel(yAxisKey),
      'Memory (MB)',
      'GFLOPs',
    ];

    const rows = runs.map((r) => [
      r.code,
      `"${r.name}"`,
      r.gitCommit,
      r.baseline ? 'Yes' : 'No',
      paretoIds.has(r.id) ? 'Yes' : 'No',
      `"${r.hardware.device}"`,
      r.metrics[xAxisKey] ?? '',
      r.metrics[yAxisKey] ?? '',
      r.metrics.memoryMb ?? '',
      r.metrics.flopsG ?? '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `researchos_pareto_benchmarks_${workspace.name || 'lab'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Top Banner / Studio Control Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Sliders className="h-3.5 w-3.5" />
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                Empirical Benchmark Studio & Pareto Frontier
              </h1>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                {runs.length} Evaluated Runs
              </span>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-400">
                {paretoRuns.length} Pareto Optimal
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Multi-objective trade-off analysis between accuracy, compute FLOPs, edge latency, and hardware thermal envelopes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Axis Selectors */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-1">
              <span className="px-2 text-[10px] font-bold uppercase text-slate-400">X-Axis:</span>
              <select
                value={xAxisKey}
                onChange={(e) => setXAxisKey(e.target.value as XAxisMetric)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 border-none outline-none cursor-pointer"
              >
                <option value="latencyMs">Latency (ms)</option>
                <option value="flopsG">Complexity (GFLOPs)</option>
                <option value="memoryMb">VRAM Memory (MB)</option>
                <option value="powerWatts">Thermal Power (Watts)</option>
              </select>

              <span className="px-2 text-[10px] font-bold uppercase text-slate-400 border-l border-slate-800">
                Y-Axis:
              </span>
              <select
                value={yAxisKey}
                onChange={(e) => setYAxisKey(e.target.value as YAxisMetric)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 border-none outline-none cursor-pointer"
              >
                <option value="accuracy">Accuracy (%)</option>
                <option value="throughputTokensOrFps">Throughput (FPS / tok/s)</option>
                <option value="primaryMetricValue">Primary Metric</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 2D Pareto Frontier + Side Inspector */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Interactive Pareto Frontier & Scatter (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Scatter Chart Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  Multi-Objective Trade-Off Landscape
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any scatter point to inspect execution parameters, loss curves, and empirical metrics.
                </p>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-[11px] font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
                  <span className="text-slate-300">Pareto Optimal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
                  <span className="text-slate-300">Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-300">Candidate Run</span>
                </div>
              </div>
            </div>

            {/* Recharts Scatter View */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={getMetricLabel(xAxisKey)}
                    unit={xAxisKey === 'latencyMs' ? 'ms' : xAxisKey === 'flopsG' ? 'G' : xAxisKey === 'memoryMb' ? 'MB' : 'W'}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name={getMetricLabel(yAxisKey)}
                    unit="%"
                    domain={['dataMin - 5', 'dataMax + 2']}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const run: BenchmarkRun = data.raw;
                        return (
                          <div className="rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl text-xs space-y-1.5 z-50">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-bold text-white font-mono">{run.code}</span>
                              {data.isPareto && (
                                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                                  PARETO FRONTIER
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-slate-200">{run.name}</p>
                            <div className="border-t border-slate-800 pt-1.5 text-slate-400 space-y-0.5 font-mono text-[11px]">
                              <div>
                                {getMetricLabel(xAxisKey)}: <span className="text-slate-200 font-bold">{data.x}</span>
                              </div>
                              <div>
                                {getMetricLabel(yAxisKey)}: <span className="text-emerald-400 font-bold">{data.y}%</span>
                              </div>
                              <div>
                                Device: <span className="text-slate-300">{run.hardware.device}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Hardware Constraint Line */}
                  {xAxisKey === 'latencyMs' && (
                    <ReferenceLine
                      x={latencyThreshold}
                      stroke="#f43f5e"
                      strokeDasharray="4 4"
                      label={{
                        value: `Real-Time Constraint (${latencyThreshold}ms)`,
                        fill: '#f43f5e',
                        fontSize: 10,
                        position: 'top',
                      }}
                    />
                  )}

                  {xAxisKey === 'powerWatts' && (
                    <ReferenceLine
                      x={powerCap}
                      stroke="#f43f5e"
                      strokeDasharray="4 4"
                      label={{
                        value: `Capsule Thermal Envelope (${powerCap}W)`,
                        fill: '#f43f5e',
                        fontSize: 10,
                        position: 'top',
                      }}
                    />
                  )}

                  <Scatter
                    data={scatterData}
                    onClick={(entry) => setSelectedRunId(entry.id)}
                    cursor="pointer"
                  >
                    {scatterData.map((entry, index) => {
                      let fillColor = '#6366f1'; // Candidate (indigo)
                      if (entry.isPareto) fillColor = '#10b981'; // Pareto (emerald)
                      if (entry.isBaseline) fillColor = '#f59e0b'; // Baseline (amber)
                      const isChosen = entry.id === selectedRunId;

                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={fillColor}
                          stroke={isChosen ? '#ffffff' : fillColor}
                          strokeWidth={isChosen ? 3 : 1}
                          r={isChosen ? 8 : entry.isPareto ? 6.5 : 5}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Threshold Sliders & Controls */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                  Real-Time Latency Deadline:
                </span>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={latencyThreshold}
                  onChange={(e) => setLatencyThreshold(Number(e.target.value))}
                  className="accent-indigo-500 cursor-pointer w-32"
                />
                <span className="font-mono font-bold text-slate-200">{latencyThreshold} ms</span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span>Baseline Reference:</span>
                <select
                  value={baselineRunId}
                  onChange={(e) => setBaselineRunId(e.target.value)}
                  className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-200 border border-slate-700 outline-none cursor-pointer"
                >
                  {runs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} - {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* All Runs Evaluation Matrix Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 backdrop-blur-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                Benchmark Runs Registry ({runs.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Run Code</th>
                    <th className="py-2.5 px-3">Model Architecture / Config</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">GFLOPs</th>
                    <th className="py-2.5 px-3">VRAM</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {runs.map((r) => {
                    const isSelected = r.id === selectedRunId;
                    const isPareto = paretoIds.has(r.id);
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRunId(r.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-950/60 font-medium text-white'
                            : 'hover:bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span
                            className={`rounded px-1.5 py-0.5 ${
                              r.baseline
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : isPareto
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {r.code}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 max-w-[180px] truncate font-semibold">
                          {r.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          {r.metrics.accuracy ?? r.metrics.primaryMetricValue}%
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {r.metrics.latencyMs} ms
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {r.metrics.flopsG} G
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {r.metrics.memoryMb} MB
                        </td>
                        <td className="py-2.5 px-3">
                          {isPareto ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="h-2.5 w-2.5" /> Pareto
                            </span>
                          ) : r.baseline ? (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                              Baseline
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Evaluated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Run Inspector & Comparative Deltas (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {selectedRun ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 backdrop-blur-md shadow-xl space-y-5">
              {/* Run Title Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                      {selectedRun.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <GitCommit className="h-3 w-3" />
                      {selectedRun.gitCommit}
                    </span>
                  </div>
                  {paretoIds.has(selectedRun.id) && (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                      ★ Pareto Frontier
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-white mt-1.5 leading-snug">
                  {selectedRun.name}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <Cpu className="h-3.5 w-3.5 text-slate-500" />
                  <span>{selectedRun.hardware.device} ({selectedRun.hardware.vram})</span>
                </div>
              </div>

              {/* Comparative Delta Cards vs Baseline */}
              {delta && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
                    <span>Performance Delta vs {baselineRun?.code}</span>
                    <span className="text-[10px] text-indigo-400 lowercase font-normal">
                      (relative improvement)
                    </span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Latency Speedup */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <div className="text-[10px] font-semibold text-slate-400">Inference Speedup</div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-emerald-400 font-mono">
                          {delta.latencySpeedup.toFixed(2)}x
                        </span>
                        <span className="text-[10px] text-slate-400">faster</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {selectedRun.metrics.latencyMs}ms vs {baselineRun.metrics.latencyMs}ms
                      </div>
                    </div>

                    {/* Accuracy Delta */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <div className="text-[10px] font-semibold text-slate-400">Accuracy Retention</div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span
                          className={`text-lg font-bold font-mono ${
                            delta.accDelta >= 0
                              ? 'text-emerald-400'
                              : delta.accDelta > -1.0
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {delta.accDelta > 0 ? `+${delta.accDelta.toFixed(1)}%` : `${delta.accDelta.toFixed(1)}%`}
                        </span>
                        <span className="text-[10px] text-slate-400">abs delta</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {selectedRun.metrics.accuracy}% vs {baselineRun.metrics.accuracy}%
                      </div>
                    </div>

                    {/* FLOPs Compression */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <div className="text-[10px] font-semibold text-slate-400">FLOPs Reduction</div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-indigo-400 font-mono">
                          {delta.flopsCompression.toFixed(2)}x
                        </span>
                        <span className="text-[10px] text-slate-400">less compute</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {selectedRun.metrics.flopsG}G vs {baselineRun.metrics.flopsG}G
                      </div>
                    </div>

                    {/* Memory Footprint Savings */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                      <div className="text-[10px] font-semibold text-slate-400">Memory Saved</div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-purple-400 font-mono">
                          {delta.memorySavings.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-400">VRAM reduction</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {selectedRun.metrics.memoryMb}MB vs {baselineRun.metrics.memoryMb}MB
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loss / Metric Convergence Curves Chart */}
              {selectedRun.lossConvergence && selectedRun.lossConvergence.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-indigo-400" />
                      Training Loss & Metric Convergence
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedRun.lossConvergence.length} Epochs
                    </span>
                  </div>

                  <div className="h-40 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={selectedRun.lossConvergence}
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                        <XAxis
                          dataKey="epochOrStep"
                          stroke="#64748b"
                          fontSize={10}
                          tickLine={false}
                        />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            fontSize: '11px',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="valLoss"
                          name="Validation Loss"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="metricValue"
                          name="Accuracy (%)"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Hyperparameters Config Grid */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                  Hyperparameter & Configuration Manifest
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(selectedRun.hyperparameters).map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-slate-950 p-2 border border-slate-800">
                      <div className="text-[10px] text-slate-400 capitalize">{k}</div>
                      <div className="text-slate-200 font-bold truncate mt-0.5">
                        {typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provenance Actions: Promote to Decision / Publication Claim */}
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => {
                    openCreateModal('decision');
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Log Architectural Decision from Run {selectedRun.code}</span>
                </button>

                <button
                  onClick={() => {
                    openCreateModal('claim');
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Promote to Publication Claim (Paper Claim)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-slate-500">
              <Scale className="h-10 w-10 stroke-1 text-slate-600 mb-2" />
              <p className="text-sm font-semibold">Select a Benchmark Run</p>
              <p className="text-xs text-slate-600 mt-1">
                Click any scatter point or table row to inspect performance metrics and trade-offs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
