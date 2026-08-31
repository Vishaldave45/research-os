import { BenchmarkRun } from '../types/research';

export const BENCHMARK_RUNS: Record<string, BenchmarkRun[]> = {
  // Domain 1: DepthReduce Lab (Biomedical Capsule Endoscopy)
  'ws-canonical-wce': [
    {
      id: 'run-wce-01',
      code: 'RUN-001',
      name: 'Baseline ViT-B/16 (Uncompressed)',
      experimentId: 'e-1',
      baseline: true,
      paretoOptimal: false,
      status: 'completed',
      gitCommit: 'a19f802',
      hardware: {
        device: 'NVIDIA Jetson Orin Nano',
        vram: '8GB Unified LPDDR5',
        powerCapWatts: 7.0,
      },
      hyperparameters: {
        architecture: 'ViT-B/16',
        patchSize: 16,
        depth: 12,
        embedDim: 768,
        heads: 12,
        batchSize: 1,
        precision: 'FP16',
      },
      metrics: {
        accuracy: 94.2,
        primaryMetricLabel: 'Polyp Detection Top-1 (%)',
        primaryMetricValue: 94.2,
        latencyMs: 142.5,
        flopsG: 17.6,
        memoryMb: 342.0,
        powerWatts: 4.8,
        throughputTokensOrFps: 7.0,
      },
      lossConvergence: [
        { epochOrStep: 10, trainLoss: 1.45, valLoss: 1.52, metricValue: 72.1 },
        { epochOrStep: 20, trainLoss: 0.88, valLoss: 0.95, metricValue: 84.6 },
        { epochOrStep: 30, trainLoss: 0.52, valLoss: 0.61, metricValue: 91.2 },
        { epochOrStep: 40, trainLoss: 0.31, valLoss: 0.44, metricValue: 93.8 },
        { epochOrStep: 50, trainLoss: 0.22, valLoss: 0.38, metricValue: 94.2 },
      ],
      createdAt: '2026-01-20T10:00:00.000Z',
    },
    {
      id: 'run-wce-02',
      code: 'RUN-002',
      name: 'Standard Layer Pruning (4 layers removed)',
      experimentId: 'e-1',
      baseline: false,
      paretoOptimal: false,
      status: 'completed',
      gitCommit: 'b44c911',
      hardware: {
        device: 'NVIDIA Jetson Orin Nano',
        vram: '8GB Unified LPDDR5',
        powerCapWatts: 7.0,
      },
      hyperparameters: {
        architecture: 'ViT-8L-Pruned',
        patchSize: 16,
        depth: 8,
        embedDim: 768,
        heads: 12,
        batchSize: 1,
        precision: 'FP16',
      },
      metrics: {
        accuracy: 89.1,
        primaryMetricLabel: 'Polyp Detection Top-1 (%)',
        primaryMetricValue: 89.1,
        latencyMs: 98.4,
        flopsG: 11.8,
        memoryMb: 235.0,
        powerWatts: 3.4,
        throughputTokensOrFps: 10.2,
      },
      lossConvergence: [
        { epochOrStep: 10, trainLoss: 1.62, valLoss: 1.70, metricValue: 68.4 },
        { epochOrStep: 20, trainLoss: 1.05, valLoss: 1.14, metricValue: 79.5 },
        { epochOrStep: 30, trainLoss: 0.74, valLoss: 0.86, metricValue: 86.1 },
        { epochOrStep: 40, trainLoss: 0.51, valLoss: 0.69, metricValue: 88.7 },
        { epochOrStep: 50, trainLoss: 0.42, valLoss: 0.62, metricValue: 89.1 },
      ],
      createdAt: '2026-01-20T14:30:00.000Z',
    },
    {
      id: 'run-wce-03',
      code: 'RUN-003',
      name: 'Uniform INT8 Post-Training Quantization',
      experimentId: 'e-1',
      baseline: false,
      paretoOptimal: false,
      status: 'completed',
      gitCommit: 'c90e128',
      hardware: {
        device: 'NVIDIA Jetson Orin Nano',
        vram: '8GB Unified LPDDR5',
        powerCapWatts: 7.0,
      },
      hyperparameters: {
        architecture: 'ViT-B/16-INT8',
        patchSize: 16,
        depth: 12,
        embedDim: 768,
        heads: 12,
        batchSize: 1,
        precision: 'INT8',
      },
      metrics: {
        accuracy: 92.4,
        primaryMetricLabel: 'Polyp Detection Top-1 (%)',
        primaryMetricValue: 92.4,
        latencyMs: 76.2,
        flopsG: 8.9,
        memoryMb: 172.0,
        powerWatts: 2.8,
        throughputTokensOrFps: 13.1,
      },
      lossConvergence: [
        { epochOrStep: 10, trainLoss: 1.45, valLoss: 1.55, metricValue: 71.0 },
        { epochOrStep: 20, trainLoss: 0.90, valLoss: 0.98, metricValue: 83.2 },
        { epochOrStep: 30, trainLoss: 0.58, valLoss: 0.68, metricValue: 89.8 },
        { epochOrStep: 40, trainLoss: 0.38, valLoss: 0.51, metricValue: 91.9 },
        { epochOrStep: 50, trainLoss: 0.29, valLoss: 0.46, metricValue: 92.4 },
      ],
      createdAt: '2026-01-21T09:15:00.000Z',
    },
    {
      id: 'run-wce-04',
      code: 'RUN-004',
      name: 'DepthReduce: Layer Folding + Spatial Pruning (Ours)',
      experimentId: 'e-1',
      hypothesisId: 'h-1',
      resultId: 'r-1',
      baseline: false,
      paretoOptimal: true,
      status: 'completed',
      gitCommit: 'f87a329',
      hardware: {
        device: 'NVIDIA Jetson Orin Nano',
        vram: '8GB Unified LPDDR5',
        powerCapWatts: 2.1,
      },
      hyperparameters: {
        architecture: 'DepthReduce-ViT',
        patchSize: 16,
        depth: 6,
        layerFoldingFactor: 2.0,
        spatialPruneRatio: 0.38,
        embedDim: 768,
        heads: 12,
        batchSize: 1,
        precision: 'Mixed INT8/FP16',
      },
      metrics: {
        accuracy: 93.8,
        primaryMetricLabel: 'Polyp Detection Top-1 (%)',
        primaryMetricValue: 93.8,
        latencyMs: 31.4,
        flopsG: 4.2,
        memoryMb: 88.5,
        powerWatts: 1.85,
        throughputTokensOrFps: 31.8,
      },
      lossConvergence: [
        { epochOrStep: 10, trainLoss: 1.38, valLoss: 1.42, metricValue: 74.2 },
        { epochOrStep: 20, trainLoss: 0.79, valLoss: 0.85, metricValue: 86.8 },
        { epochOrStep: 30, trainLoss: 0.44, valLoss: 0.53, metricValue: 91.9 },
        { epochOrStep: 40, trainLoss: 0.28, valLoss: 0.39, metricValue: 93.4 },
        { epochOrStep: 50, trainLoss: 0.19, valLoss: 0.32, metricValue: 93.8 },
      ],
      createdAt: '2026-01-21T16:00:00.000Z',
    },
    {
      id: 'run-wce-05',
      code: 'RUN-005',
      name: 'DepthReduce Ultra-Light (50% Spatial Pruned)',
      experimentId: 'e-1',
      baseline: false,
      paretoOptimal: true,
      status: 'completed',
      gitCommit: 'd11e992',
      hardware: {
        device: 'NVIDIA Jetson Orin Nano',
        vram: '8GB Unified LPDDR5',
        powerCapWatts: 2.1,
      },
      hyperparameters: {
        architecture: 'DepthReduce-Ultra',
        patchSize: 16,
        depth: 4,
        layerFoldingFactor: 3.0,
        spatialPruneRatio: 0.52,
        embedDim: 512,
        heads: 8,
        batchSize: 1,
        precision: 'INT8',
      },
      metrics: {
        accuracy: 91.6,
        primaryMetricLabel: 'Polyp Detection Top-1 (%)',
        primaryMetricValue: 91.6,
        latencyMs: 19.8,
        flopsG: 2.6,
        memoryMb: 54.0,
        powerWatts: 1.35,
        throughputTokensOrFps: 50.5,
      },
      lossConvergence: [
        { epochOrStep: 10, trainLoss: 1.55, valLoss: 1.62, metricValue: 70.5 },
        { epochOrStep: 20, trainLoss: 0.95, valLoss: 1.02, metricValue: 82.3 },
        { epochOrStep: 30, trainLoss: 0.62, valLoss: 0.72, metricValue: 88.4 },
        { epochOrStep: 40, trainLoss: 0.41, valLoss: 0.54, metricValue: 90.8 },
        { epochOrStep: 50, trainLoss: 0.32, valLoss: 0.47, metricValue: 91.6 },
      ],
      createdAt: '2026-01-22T11:00:00.000Z',
    },
  ],

  // Domain 2: DistilReason Lab (NLP & LLM Quantization)
  'ws-distil-reason': [
    {
      id: 'run-nlp-01',
      code: 'RUN-001',
      name: 'LLaMA-3-8B FP16 Uncompressed Baseline',
      experimentId: 'e-nlp-01',
      baseline: true,
      paretoOptimal: false,
      status: 'completed',
      gitCommit: '8d2a101',
      hardware: {
        device: 'NVIDIA RTX 4090 24GB',
        vram: '24GB GDDR6X',
      },
      hyperparameters: {
        model: 'Meta-Llama-3-8B-Instruct',
        kvBits: 16,
        outlierPercentile: '0%',
        contextWindow: 8192,
      },
      metrics: {
        accuracy: 84.1,
        primaryMetricLabel: 'GSM8K Pass@1 (%)',
        primaryMetricValue: 84.1,
        latencyMs: 1840.0,
        flopsG: 820.0,
        memoryMb: 18800.0,
        throughputTokensOrFps: 22.4,
      },
      createdAt: '2026-02-17T10:00:00.000Z',
    },
    {
      id: 'run-nlp-02',
      code: 'RUN-002',
      name: 'Uniform INT4 KV Cache Quantization',
      experimentId: 'e-nlp-01',
      baseline: false,
      paretoOptimal: false,
      status: 'completed',
      gitCommit: '9c3b202',
      hardware: {
        device: 'NVIDIA RTX 4090 24GB',
        vram: '24GB GDDR6X',
      },
      hyperparameters: {
        model: 'Meta-Llama-3-8B-Instruct',
        kvBits: 4,
        outlierPercentile: '0%',
        contextWindow: 8192,
      },
      metrics: {
        accuracy: 78.6,
        primaryMetricLabel: 'GSM8K Pass@1 (%)',
        primaryMetricValue: 78.6,
        latencyMs: 910.0,
        flopsG: 820.0,
        memoryMb: 5200.0,
        throughputTokensOrFps: 48.0,
      },
      createdAt: '2026-02-17T14:00:00.000Z',
    },
    {
      id: 'run-nlp-03',
      code: 'RUN-003',
      name: 'KIVI 2-bit Asymmetric KV Cache',
      experimentId: 'e-nlp-01',
      baseline: false,
      paretoOptimal: true,
      status: 'completed',
      gitCommit: 'a45c303',
      hardware: {
        device: 'NVIDIA RTX 4090 24GB',
        vram: '24GB GDDR6X',
      },
      hyperparameters: {
        model: 'Meta-Llama-3-8B-Instruct',
        kvBits: 2,
        outlierPercentile: '0%',
        contextWindow: 8192,
      },
      metrics: {
        accuracy: 71.2,
        primaryMetricLabel: 'GSM8K Pass@1 (%)',
        primaryMetricValue: 71.2,
        latencyMs: 640.0,
        flopsG: 820.0,
        memoryMb: 2900.0,
        throughputTokensOrFps: 76.5,
      },
      createdAt: '2026-02-18T09:00:00.000Z',
    },
    {
      id: 'run-nlp-04',
      code: 'RUN-004',
      name: 'Outlier-Protected FP4 KV Cache (Ours)',
      experimentId: 'e-nlp-01',
      hypothesisId: 'h-nlp-01',
      resultId: 'r-nlp-01',
      baseline: false,
      paretoOptimal: true,
      status: 'completed',
      gitCommit: 'e78d404',
      hardware: {
        device: 'NVIDIA RTX 4090 24GB',
        vram: '24GB GDDR6X',
      },
      hyperparameters: {
        model: 'Meta-Llama-3-8B-Instruct',
        kvBits: 4,
        outlierPercentile: '99.5th',
        format: 'E2M1',
        contextWindow: 8192,
      },
      metrics: {
        accuracy: 83.4,
        primaryMetricLabel: 'GSM8K Pass@1 (%)',
        primaryMetricValue: 83.4,
        latencyMs: 750.0,
        flopsG: 820.0,
        memoryMb: 4800.0,
        throughputTokensOrFps: 64.2,
      },
      createdAt: '2026-02-19T11:00:00.000Z',
    },
  ],

  // Domain 3: DexterousPolicy Lab (Robotics)
  'ws-dexterous-policy': [
    {
      id: 'run-rob-01',
      code: 'RUN-001',
      name: 'Standard 100-step DDPM Policy',
      experimentId: 'e-rob-01',
      baseline: true,
      paretoOptimal: false,
      status: 'completed',
      gitCommit: '1122334',
      hardware: {
        device: 'Embedded Jetson AGX Orin',
        vram: '32GB',
      },
      hyperparameters: {
        diffusionSteps: 100,
        scheduler: 'DDPM',
        actionChunk: 16,
      },
      metrics: {
        accuracy: 97.0,
        primaryMetricLabel: 'Reorientation Success (%)',
        primaryMetricValue: 97.0,
        latencyMs: 124.0,
        flopsG: 48.0,
        memoryMb: 1420.0,
        throughputTokensOrFps: 8.1,
      },
      createdAt: '2026-01-30T10:00:00.000Z',
    },
    {
      id: 'run-rob-02',
      code: 'RUN-002',
      name: 'Consistency Distilled 4-step Policy (Ours)',
      experimentId: 'e-rob-01',
      hypothesisId: 'h-rob-01',
      resultId: 'r-rob-01',
      baseline: false,
      paretoOptimal: true,
      status: 'completed',
      gitCommit: '5566778',
      hardware: {
        device: 'Embedded Jetson AGX Orin',
        vram: '32GB',
      },
      hyperparameters: {
        diffusionSteps: 4,
        scheduler: 'Consistency Trajectory',
        actionChunk: 16,
      },
      metrics: {
        accuracy: 96.5,
        primaryMetricLabel: 'Reorientation Success (%)',
        primaryMetricValue: 96.5,
        latencyMs: 17.8,
        flopsG: 6.8,
        memoryMb: 890.0,
        throughputTokensOrFps: 56.2,
      },
      createdAt: '2026-02-02T14:00:00.000Z',
    },
  ],

  // Domain 4: BioAffinity Lab (Drug Discovery)
  'ws-bio-affinity': [
    {
      id: 'run-bio-01',
      code: 'RUN-001',
      name: 'AutoDock Vina Empirical Baseline',
      experimentId: 'e-bio-01',
      baseline: true,
      paretoOptimal: false,
      status: 'completed',
      gitCommit: 'vina-v1',
      hardware: {
        device: 'CPU 16-Core Threadripper',
        vram: '64GB RAM',
      },
      hyperparameters: {
        exhaustiveness: 8,
        gridSpacing: 0.375,
      },
      metrics: {
        accuracy: 61.2,
        primaryMetricLabel: 'Pearson Correlation r (%)',
        primaryMetricValue: 61.2,
        latencyMs: 4200.0,
        flopsG: 0.5,
        memoryMb: 240.0,
        throughputTokensOrFps: 0.24,
      },
      createdAt: '2026-01-25T09:00:00.000Z',
    },
    {
      id: 'run-bio-02',
      code: 'RUN-002',
      name: 'SE(3)-EnsembleEGNN (Ours)',
      experimentId: 'e-bio-01',
      hypothesisId: 'h-bio-01',
      resultId: 'r-bio-01',
      baseline: false,
      paretoOptimal: true,
      status: 'completed',
      gitCommit: 'egnn-c89',
      hardware: {
        device: 'NVIDIA RTX A6000 48GB',
        vram: '48GB',
      },
      hyperparameters: {
        layers: 6,
        conformations: 8,
        equivariantConv: 'SE(3)',
      },
      metrics: {
        accuracy: 84.2,
        primaryMetricLabel: 'Pearson Correlation r (%)',
        primaryMetricValue: 84.2,
        latencyMs: 4.2,
        flopsG: 8.4,
        memoryMb: 520.0,
        throughputTokensOrFps: 238.0,
      },
      createdAt: '2026-02-01T15:00:00.000Z',
    },
  ],
};

/**
 * Calculates 2D Pareto frontier points given X (e.g. latency/flops/memory to MINIMIZE)
 * and Y (e.g. accuracy/score to MAXIMIZE).
 */
export function calculateParetoFrontier(
  runs: BenchmarkRun[],
  xKey: keyof BenchmarkRun['metrics'] = 'latencyMs',
  yKey: keyof BenchmarkRun['metrics'] = 'accuracy',
  minimizeX: boolean = true,
  maximizeY: boolean = true
): BenchmarkRun[] {
  if (!runs || runs.length === 0) return [];

  const validRuns = runs.filter(
    (r) =>
      typeof r.metrics[xKey] === 'number' &&
      typeof r.metrics[yKey] === 'number'
  );

  // Sort by X
  const sorted = [...validRuns].sort((a, b) => {
    const xA = a.metrics[xKey] as number;
    const xB = b.metrics[xKey] as number;
    return minimizeX ? xA - xB : xB - xA;
  });

  const paretoPoints: BenchmarkRun[] = [];
  let bestY = maximizeY ? -Infinity : Infinity;

  for (const run of sorted) {
    const yVal = run.metrics[yKey] as number;
    const isBetterY = maximizeY ? yVal > bestY : yVal < bestY;

    if (isBetterY) {
      paretoPoints.push(run);
      bestY = yVal;
    }
  }

  return paretoPoints;
}

/**
 * Computes comparative delta between two runs
 */
export function computeRunDelta(
  candidate: BenchmarkRun,
  baseline: BenchmarkRun
) {
  const candAcc = candidate.metrics.accuracy ?? candidate.metrics.primaryMetricValue;
  const baseAcc = baseline.metrics.accuracy ?? baseline.metrics.primaryMetricValue;

  const accDelta = candAcc - baseAcc;
  const accDeltaPct = ((accDelta) / baseAcc) * 100;

  const candLat = candidate.metrics.latencyMs;
  const baseLat = baseline.metrics.latencyMs;
  const latencySpeedup = baseLat / (candLat || 1);

  const candFlops = candidate.metrics.flopsG;
  const baseFlops = baseline.metrics.flopsG;
  const flopsCompression = baseFlops / (candFlops || 1);

  const candMem = candidate.metrics.memoryMb;
  const baseMem = baseline.metrics.memoryMb;
  const memorySavings = ((baseMem - candMem) / (baseMem || 1)) * 100;

  return {
    accDelta,
    accDeltaPct,
    latencySpeedup,
    flopsCompression,
    memorySavings,
  };
}
