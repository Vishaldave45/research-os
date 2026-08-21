import {
  ResearchQuestionEntity,
  PaperEntity,
  GapEntity,
  HypothesisEntity,
  ExperimentEntity,
  ResultEntity,
  DecisionEntity,
  ClaimEntity,
  RelationshipLink,
  Workspace,
} from '../types/research';

export const CANONICAL_WORKSPACE: Workspace = {
  id: 'ws-wce-edge-ai',
  name: 'WCE Edge AI: Thermal-Aware Vision Transformers',
  description:
    'Investigates algorithm-hardware co-design to compress Vision Transformers for high-throughput in-vivo Wireless Capsule Endoscopy under 2.5W thermal dissipation envelopes.',
  createdAt: '2026-01-15T08:00:00.000Z',
};

export const INITIAL_QUESTIONS: ResearchQuestionEntity[] = [
  {
    id: 'q-001',
    code: 'Q-001',
    type: 'question',
    title:
      'How can high-frame-rate Transformer architectures achieve real-time mucosal lesion detection within the ultra-low 2.5W thermal envelope of Wireless Capsule Endoscopy edge hardware?',
    description:
      'Investigates algorithm-hardware co-design strategies to compress Vision Transformers for high-throughput in-vivo capsule endoscopy without diagnostic sensitivity loss.',
    status: 'active',
    priority: 'critical',
    createdAt: '2026-01-15T09:00:00.000Z',
    metadata: {
      clinicalTarget: 'Small Bowel Mucosal Lesions & Vascular Ectasias',
      targetHardware: 'NVIDIA Jetson Nano / Coral Edge TPU / ARM Cortex-M85',
      safetyCeiling: '2.5W Continuous / 41.5°C Shell Temperature',
    },
  },
];

export const INITIAL_PAPERS: PaperEntity[] = [
  {
    id: 'p-001',
    code: 'P-001',
    type: 'paper',
    title:
      'Vision Transformers for Gastrointestinal Video Capsule Endoscopy: A Review of Latency Constraints',
    authors: ['Almeida, R.', 'Venkatesh, S.', 'Kaur, P.'],
    year: 2023,
    venue: 'IEEE Transactions on Medical Imaging (TMI)',
    doi: '10.1109/TMI.2023.3289110',
    url: 'https://doi.org/10.1109/TMI.2023.3289110',
    abstract:
      'Evaluates standard Swin and ViT backbones on multi-center WCE datasets. Demonstrates that while attention mechanisms excel at long-range polyp boundary detection, standard floating-point architectures require >12W power, leading to immediate thermal failure in closed capsule environments.',
    notes:
      'Identifies that memory bandwidth during self-attention computation is the primary thermal bottleneck on capsule SoCs.',
    citationCount: 48,
    createdAt: '2026-01-16T10:00:00.000Z',
  },
  {
    id: 'p-002',
    code: 'P-002',
    type: 'paper',
    title:
      'INT4 Post-Training Quantization of Attention Blocks in Resource-Constrained Medical Devices',
    authors: ['Chen, H.', 'Zhao, Y.', 'Leung, T.'],
    year: 2023,
    venue: 'MICCAI 2023',
    doi: '10.1007/978-3-031-43907-0_24',
    url: 'https://doi.org/10.1007/978-3-031-43907-0_24',
    abstract:
      'Presents 4-bit uniform integer quantization for Transformer projections. Demonstrates 3.8x memory reduction on simulated microcontrollers, but reports a 7.2% drop in sensitivity for faint mucosal vascular lesions due to activation outlier clamping.',
    notes:
      'Crucial baseline for INT4 quantization trade-offs; notes catastrophic boundary loss when outliers are clipped.',
    citationCount: 31,
    createdAt: '2026-01-16T11:30:00.000Z',
  },
  {
    id: 'p-003',
    code: 'P-003',
    type: 'paper',
    title:
      'Spatial Patch Folding: Preserving High-Frequency Mucosal Boundaries Under Extreme Token Sparsification',
    authors: ['Gupta, M.', "O'Connor, D.", 'Sato, K.'],
    year: 2024,
    venue: 'Nature Machine Intelligence',
    doi: '10.1038/s42256-024-00812-w',
    url: 'https://doi.org/10.1038/s42256-024-00812-w',
    abstract:
      'Introduces multi-scale spatial patch folding, grouping adjacent mucosal textures into compressed folded tokens prior to linear projection. Preserves boundary gradients while reducing total sequence length by 50%.',
    notes:
      'Forms the foundational theoretical method for our folded edge architecture.',
    citationCount: 19,
    createdAt: '2026-01-17T09:15:00.000Z',
  },
  {
    id: 'p-004',
    code: 'P-004',
    type: 'paper',
    title:
      'In-Vivo Thermal Dissipation Thresholds for Ingestible Micro-Electronics in Gastrointestinal Lumens',
    authors: ['Fischer, K.', 'Moser, E.', 'Zimmermann, T.'],
    year: 2022,
    venue: 'Journal of Biomedical Engineering',
    doi: '10.1016/j.jbe.2022.104112',
    url: 'https://doi.org/10.1016/j.jbe.2022.104112',
    abstract:
      'Establishes that capsule outer surface temperatures must not exceed 41.5°C for longer than 3 minutes to avoid localized mucosal thermal injury. Caps total continuous power dissipation at 2.4W in the small intestine.',
    notes: 'Dictates our strict 2.5W / 41.5°C empirical safety boundary.',
    citationCount: 64,
    createdAt: '2026-01-17T14:00:00.000Z',
  },
];

export const INITIAL_GAPS: GapEntity[] = [
  {
    id: 'g-001',
    code: 'G-001',
    type: 'gap',
    title:
      'Severe boundary degradation of mucosal vascular lesions under standard 4-bit INT quantization.',
    description:
      'Existing INT4 quantization schemes clamp activation outliers uniformly across all token patches, eliminating the fine sub-millimeter color and texture gradients required to differentiate angiodysplasia from healthy mucosa.',
    impactLevel: 'critical',
    status: 'addressed',
    createdAt: '2026-01-18T10:00:00.000Z',
  },
  {
    id: 'g-002',
    code: 'G-002',
    type: 'gap',
    title:
      'Thermal runaway exceeding 41.5°C when running standard self-attention at >=30 FPS.',
    description:
      'Full-resolution multi-head attention creates quadratic memory access overhead, spiking capsule skin temperature past the in-vivo 41.5°C thermal safety envelope within 90 seconds of continuous 30+ FPS capture.',
    impactLevel: 'high',
    status: 'addressed',
    createdAt: '2026-01-18T11:00:00.000Z',
  },
];

export const INITIAL_HYPOTHESES: HypothesisEntity[] = [
  {
    id: 'h-001',
    code: 'H-001',
    type: 'hypothesis',
    title: 'Spatial Patch Folding + Asymmetric INT4 Quantization',
    statement:
      'Spatial patch folding combined with asymmetric 4-bit INT quantization preserves mucosal lesion boundary gradients while reducing memory traffic by >60%, maintaining AUC >= 0.95 at 2.1W.',
    rationale:
      'By folding local spatial neighborhoods into multi-scale tokens before quantization, high-frequency textural variance is preserved in the mantissa, preventing the outlier clamping observed in uniform INT4.',
    expectedOutcome:
      'Throughput >= 45 FPS on Jetson Nano / Edge TPU with <=2.2W power draw and <=0.01 AUC drop compared to unquantized FP32 baseline.',
    status: 'supported',
    confidence: 0.94,
    createdAt: '2026-01-19T13:00:00.000Z',
  },
  {
    id: 'h-002',
    code: 'H-002',
    type: 'hypothesis',
    title: 'Dynamic Token Pruning on Non-Pathological Mucosa',
    statement:
      'Dynamic token pruning during non-pathological frame sequences restricts peak capsule surface temperature below 39.8°C during sustained 4-hour WCE procedures.',
    rationale:
      'Over 88% of small bowel frames contain normal mucosa; dynamic token gating can throttle inference frequency without missing clinical lesions.',
    expectedOutcome:
      'Steady-state temperature <= 39.5°C with zero false negatives on rapid transit bleeding frames.',
    status: 'supported',
    confidence: 0.89,
    createdAt: '2026-01-19T14:30:00.000Z',
  },
  {
    id: 'h-003',
    code: 'H-003',
    type: 'hypothesis',
    title: 'Standard INT8 Quantization Superiority',
    statement:
      'Standard post-training INT8 quantization yields superior diagnostic performance compared to INT4 within the capsule power envelope.',
    rationale:
      'Preliminary literature claimed INT8 would retain higher sensitivity for subtle lesions without significant thermal penalties.',
    expectedOutcome:
      'INT8 will outperform INT4 in sensitivity with manageable power increase.',
    status: 'refuted',
    confidence: 0.28,
    createdAt: '2026-01-19T16:00:00.000Z',
  },
];

export const INITIAL_EXPERIMENTS: ExperimentEntity[] = [
  {
    id: 'e-001',
    code: 'E-001',
    type: 'experiment',
    title: 'FoldedViT-INT4 vs. Standard ViT Benchmark on Edge Hardware',
    description:
      'Empirical execution on edge WCE hardware testbed measuring frame latency (ms), power draw (W), and lesion detection AUC across 15,400 multi-center endoscopic frames.',
    status: 'completed',
    config: {
      architecture: 'FoldedViT-Tiny',
      quantization: 'INT4_Asymmetric',
      inputResolution: '256x256',
      batchSize: 1,
      dataset: 'Kvasir-Capsule + KID Dataset (15,400 frames)',
      learningRate: 0.0003,
      epochs: 50,
    },
    executionMetadata: {
      device: 'NVIDIA Jetson Nano 4GB (5W mode) + Coral Edge TPU',
      durationSeconds: 3840,
      powerAnalyzer: 'Yokogawa WT310E Precision Power Meter',
      commitHash: 'b7e41f92',
    },
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'e-002',
    code: 'E-002',
    type: 'experiment',
    title: 'Thermal Dissipation Profiling in 37.0°C Saline Chamber',
    description:
      'Capsule prototype submerged in viscous 37.0°C saline fluid bath running continuous 45 FPS inferencing over a 4-hour continuous capture cycle.',
    status: 'completed',
    config: {
      ambientTempC: 37.0,
      fpsTarget: 45,
      durationMinutes: 240,
      sensorArray: '6x Micro-Thermocouples mounted on outer shell',
    },
    executionMetadata: {
      chamber: 'Bio-Thermal In-Vitro Sim Chamber 4B',
      logger: 'Fluke Hydra 2635A',
      peakTempLoggedC: 39.2,
    },
    createdAt: '2026-01-21T10:30:00.000Z',
  },
  {
    id: 'e-003',
    code: 'E-003',
    type: 'experiment',
    title: 'Comparative Diagnostic Sensitivity: INT8 vs. INT4 on Obscure Bleeding',
    description:
      'Head-to-head receiver operating characteristic (ROC) evaluation of INT8 vs INT4 quantization on 3,200 subtle mucosal bleeding and angioectasia frames.',
    status: 'completed',
    config: { testFrames: 3200, confidenceThreshold: 0.5 },
    executionMetadata: {
      evaluator: 'Double-Blind Clinical Endoscopist Consensus',
    },
    createdAt: '2026-01-22T14:00:00.000Z',
  },
];

export const INITIAL_RESULTS: ResultEntity[] = [
  {
    id: 'r-001',
    code: 'R-001',
    type: 'result',
    experimentId: 'e-001',
    title: 'FoldedViT-INT4 Achieved 48.6 FPS at 2.1W with 0.952 AUC',
    summary:
      'Demonstrated 48.6 FPS sustained throughput on Jetson Nano at 2.12W mean power draw. Mucosal lesion detection AUC reached 0.952 (vs. 0.956 for uncompressed FP32 baseline), verifying boundary preservation.',
    metrics: {
      throughputFps: 48.6,
      powerWatts: 2.12,
      auc: 0.952,
      sensitivity: 0.941,
      specificity: 0.963,
      latencyMs: 10.3,
      memoryFootprintMb: 14.8,
    },
    artifacts: [
      {
        type: 'roc_curve',
        title: 'FoldedViT_INT4_ROC.png',
        url: 'https://storage.researchos.org/artifacts/wce/FoldedViT_INT4_ROC.png',
      },
      {
        type: 'thermal_map',
        title: 'Jetson_Thermal_Trace.csv',
        url: 'https://storage.researchos.org/artifacts/wce/Jetson_Thermal_Trace.csv',
      },
    ],
    status: 'valid',
    createdAt: '2026-01-21T16:00:00.000Z',
  },
  {
    id: 'r-002',
    code: 'R-002',
    type: 'result',
    experimentId: 'e-002',
    title: 'Capsule Surface Temperature Stabilized at 39.2°C Over 4 Hours',
    summary:
      'Under sustained 45 FPS inferencing with spatial folding, maximum shell temperature plateaued at 39.2°C, safely below the 41.5°C mucosal thermal injury threshold.',
    metrics: {
      maxTemperatureC: 39.2,
      safetyMarginC: 2.3,
      steadyStateTimeMin: 24.5,
      deltaTAmbientC: 2.2,
    },
    artifacts: [
      {
        type: 'chart',
        title: '4Hour_Thermal_Plateau.svg',
        url: 'https://storage.researchos.org/artifacts/wce/4Hour_Thermal_Plateau.svg',
      },
    ],
    status: 'valid',
    createdAt: '2026-01-22T17:00:00.000Z',
  },
  {
    id: 'r-003',
    code: 'R-003',
    type: 'result',
    experimentId: 'e-003',
    title: 'INT8 Exceeded Thermal Ceiling (3.8W) with Marginal AUC Advantage (+0.004)',
    summary:
      'While INT8 achieved 0.956 AUC, its 3.82W power draw caused thermal runaway to 43.1°C within 8 minutes, rendering INT8 physically unviable for in-vivo capsule deployment.',
    metrics: {
      powerWatts: 3.82,
      auc: 0.956,
      peakTemperatureC: 43.1,
      thermalRunaway: true,
    },
    artifacts: [],
    status: 'valid',
    createdAt: '2026-01-23T11:00:00.000Z',
  },
];

export const INITIAL_DECISIONS: DecisionEntity[] = [
  {
    id: 'd-001',
    code: 'D-001',
    type: 'decision',
    title:
      'Adopt Spatial Patch Folding + Asymmetric INT4 for Production Firmware',
    outcome: 'accepted',
    rationale:
      'Empirical trials (R-001, R-002) confirmed 48.6 FPS throughput at 2.12W with 0.952 AUC and 39.2°C thermal ceiling, satisfying all clinical diagnostic and biological hardware safety constraints.',
    implications:
      'All downstream firmware kernels, FPGA bitstreams, and TPU execution graphs will target FoldedViT-INT4 quantization specifications.',
    createdAt: '2026-01-24T14:00:00.000Z',
  },
  {
    id: 'd-002',
    code: 'D-002',
    type: 'decision',
    title:
      'Reject Standard INT8 and Uncompressed FP32 for In-Vivo Telemetry',
    outcome: 'rejected',
    rationale:
      'Trial R-003 proved INT8 causes thermal runaway to 43.1°C exceeding patient safety limits (P-004), despite minor +0.004 AUC score gain.',
    implications:
      'Eliminates INT8 exploration for capsule SoCs; focuses all future work on INT4/INT2 hybrid topologies.',
    createdAt: '2026-01-24T15:30:00.000Z',
  },
];

export const INITIAL_CLAIMS: ClaimEntity[] = [
  {
    id: 'c-001',
    code: 'C-001',
    type: 'claim',
    title: 'Mucosal Boundary Retention Under INT4 Quantization',
    statement:
      'Spatial patch folding preserves multi-scale mucosal lesion boundaries under extreme 4-bit INT quantization with negligible diagnostic sensitivity loss (0.952 AUC vs 0.956 FP32 baseline).',
    confidenceScore: 0.96,
    status: 'verified',
    createdAt: '2026-01-25T10:00:00.000Z',
  },
  {
    id: 'c-002',
    code: 'C-002',
    type: 'claim',
    title: 'Thermal Sustainability of Edge ViTs in Closed Lumens',
    statement:
      'Real-time in-vivo Transformer inferencing at >=48 FPS is thermally safe and sustainable within a 2.1W power budget under continuous 4-hour capsule transit.',
    confidenceScore: 0.94,
    status: 'verified',
    createdAt: '2026-01-25T11:00:00.000Z',
  },
];

export const INITIAL_RELATIONSHIPS: RelationshipLink[] = [
  // Paper citations informing Question
  {
    id: 'rel-01',
    sourceType: 'paper',
    sourceId: 'p-001',
    targetType: 'question',
    targetId: 'q-001',
    relationType: 'cites',
    createdAt: '2026-01-16T12:00:00.000Z',
  },
  {
    id: 'rel-02',
    sourceType: 'paper',
    sourceId: 'p-004',
    targetType: 'question',
    targetId: 'q-001',
    relationType: 'cites',
    createdAt: '2026-01-17T15:00:00.000Z',
  },
  // Papers informing Gaps
  {
    id: 'rel-03',
    sourceType: 'paper',
    sourceId: 'p-002',
    targetType: 'gap',
    targetId: 'g-001',
    relationType: 'informs',
    createdAt: '2026-01-18T10:30:00.000Z',
  },
  {
    id: 'rel-04',
    sourceType: 'paper',
    sourceId: 'p-001',
    targetType: 'gap',
    targetId: 'g-002',
    relationType: 'informs',
    createdAt: '2026-01-18T11:30:00.000Z',
  },
  {
    id: 'rel-05',
    sourceType: 'paper',
    sourceId: 'p-004',
    targetType: 'gap',
    targetId: 'g-002',
    relationType: 'informs',
    createdAt: '2026-01-18T12:00:00.000Z',
  },
  // Gaps motivating Hypotheses
  {
    id: 'rel-06',
    sourceType: 'gap',
    sourceId: 'g-001',
    targetType: 'hypothesis',
    targetId: 'h-001',
    relationType: 'motivates',
    createdAt: '2026-01-19T13:30:00.000Z',
  },
  {
    id: 'rel-07',
    sourceType: 'gap',
    sourceId: 'g-002',
    targetType: 'hypothesis',
    targetId: 'h-002',
    relationType: 'motivates',
    createdAt: '2026-01-19T15:00:00.000Z',
  },
  {
    id: 'rel-08',
    sourceType: 'paper',
    sourceId: 'p-003',
    targetType: 'hypothesis',
    targetId: 'h-001',
    relationType: 'informs',
    createdAt: '2026-01-19T15:30:00.000Z',
  },
  // Hypotheses addressing Question
  {
    id: 'rel-09',
    sourceType: 'hypothesis',
    sourceId: 'h-001',
    targetType: 'question',
    targetId: 'q-001',
    relationType: 'addresses',
    createdAt: '2026-01-19T16:30:00.000Z',
  },
  // Experiments testing Hypotheses
  {
    id: 'rel-10',
    sourceType: 'experiment',
    sourceId: 'e-001',
    targetType: 'hypothesis',
    targetId: 'h-001',
    relationType: 'tests',
    createdAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'rel-11',
    sourceType: 'experiment',
    sourceId: 'e-002',
    targetType: 'hypothesis',
    targetId: 'h-002',
    relationType: 'tests',
    createdAt: '2026-01-21T11:00:00.000Z',
  },
  {
    id: 'rel-12',
    sourceType: 'experiment',
    sourceId: 'e-003',
    targetType: 'hypothesis',
    targetId: 'h-003',
    relationType: 'tests',
    createdAt: '2026-01-22T14:30:00.000Z',
  },
  // Results supporting/refuting Hypotheses
  {
    id: 'rel-13',
    sourceType: 'result',
    sourceId: 'r-001',
    targetType: 'hypothesis',
    targetId: 'h-001',
    relationType: 'supports',
    createdAt: '2026-01-21T16:30:00.000Z',
  },
  {
    id: 'rel-14',
    sourceType: 'result',
    sourceId: 'r-002',
    targetType: 'hypothesis',
    targetId: 'h-002',
    relationType: 'supports',
    createdAt: '2026-01-22T17:30:00.000Z',
  },
  {
    id: 'rel-15',
    sourceType: 'result',
    sourceId: 'r-003',
    targetType: 'hypothesis',
    targetId: 'h-003',
    relationType: 'refutes',
    createdAt: '2026-01-23T12:00:00.000Z',
  },
  // Results informing Decisions
  {
    id: 'rel-16',
    sourceType: 'result',
    sourceId: 'r-001',
    targetType: 'decision',
    targetId: 'd-001',
    relationType: 'informs',
    createdAt: '2026-01-24T14:15:00.000Z',
  },
  {
    id: 'rel-17',
    sourceType: 'result',
    sourceId: 'r-002',
    targetType: 'decision',
    targetId: 'd-001',
    relationType: 'informs',
    createdAt: '2026-01-24T14:30:00.000Z',
  },
  {
    id: 'rel-18',
    sourceType: 'result',
    sourceId: 'r-003',
    targetType: 'decision',
    targetId: 'd-002',
    relationType: 'informs',
    createdAt: '2026-01-24T16:00:00.000Z',
  },
  // Results supporting Claims
  {
    id: 'rel-19',
    sourceType: 'result',
    sourceId: 'r-001',
    targetType: 'claim',
    targetId: 'c-001',
    relationType: 'supports',
    createdAt: '2026-01-25T10:30:00.000Z',
  },
  {
    id: 'rel-20',
    sourceType: 'result',
    sourceId: 'r-002',
    targetType: 'claim',
    targetId: 'c-002',
    relationType: 'supports',
    createdAt: '2026-01-25T11:30:00.000Z',
  },
  // Claims derived from Hypotheses
  {
    id: 'rel-21',
    sourceType: 'claim',
    sourceId: 'c-001',
    targetType: 'hypothesis',
    targetId: 'h-001',
    relationType: 'derived_from',
    createdAt: '2026-01-25T12:00:00.000Z',
  },
  {
    id: 'rel-22',
    sourceType: 'claim',
    sourceId: 'c-002',
    targetType: 'hypothesis',
    targetId: 'h-002',
    relationType: 'derived_from',
    createdAt: '2026-01-25T12:30:00.000Z',
  },
  // Paper citing Claims
  {
    id: 'rel-23',
    sourceType: 'paper',
    sourceId: 'p-003',
    targetType: 'claim',
    targetId: 'c-001',
    relationType: 'cites',
    createdAt: '2026-01-25T13:00:00.000Z',
  },
];
