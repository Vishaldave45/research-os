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
} from '../types/research';

export const INITIAL_QUESTIONS: ResearchQuestionEntity[] = [
  {
    id: 'q-001',
    code: 'Q-001',
    type: 'question',
    title:
      'How can depth-reduction techniques (layer folding, structured pruning, and knowledge distillation) compress deep convolutional backbones (VGG16, ResNet50, DenseNet121) for real-time Wireless Capsule Endoscopy without losing diagnostic fidelity on Kvasir-Capsule?',
    description:
      'Investigates systematic model compression and depth-reduction architectures to enable low-latency, energy-efficient inference for in-vivo endoscopic video analysis on resource-constrained hardware.',
    status: 'active',
    priority: 'critical',
    createdAt: '2026-01-15T09:00:00.000Z',
    metadata: {
      domain: 'Biomedical Computer Vision & Embedded Deep Learning',
      targetModels: 'VGG16, ResNet50, DenseNet121',
      benchmarkDatasets: 'Kvasir, Kvasir-Capsule',
    },
  },
];

export const INITIAL_PAPERS: PaperEntity[] = [
  {
    id: 'p-001',
    code: 'P-001',
    type: 'paper',
    title: 'Kvasir-Capsule: A Video Capsule Endoscopy Dataset',
    authors: ['Smedsrud, P. H.', 'Thambawita, V.', 'Hicks, S. A.', 'Halvorsen, P.'],
    year: 2021,
    venue: 'Nature Scientific Data',
    doi: '10.1038/s41597-021-00920-z',
    url: 'https://doi.org/10.1038/s41597-021-00920-z',
    abstract:
      'Presents an open-access dataset containing 47,238 labeled bounding-box and multi-class clinical frames from capsule endoscopy procedures, serving as standard benchmark for gastrointestinal abnormality classification.',
    notes: 'Standard target benchmark dataset for our model training and evaluation protocols.',
    citationCount: 142,
    createdAt: '2026-01-16T10:00:00.000Z',
  },
  {
    id: 'p-002',
    code: 'P-002',
    type: 'paper',
    title: 'Pruning Filters for Efficient ConvNets',
    authors: ['Li, H.', 'Kadav, A.', 'Durdanovic, I.', 'Samet, H.', 'Graf, H. P.'],
    year: 2017,
    venue: 'International Conference on Learning Representations (ICLR)',
    doi: '10.48550/arXiv.1608.08710',
    url: 'https://arxiv.org/abs/1608.08710',
    abstract:
      'Introduces structured filter pruning based on L1-norm magnitude to eliminate redundant convolutional feature maps without requiring specialized sparse matrix computation hardware.',
    notes: 'Methodological foundation for structured pruning baseline on VGG16 and ResNet50.',
    citationCount: 2850,
    createdAt: '2026-01-16T11:30:00.000Z',
  },
  {
    id: 'p-003',
    code: 'P-003',
    type: 'paper',
    title: 'Distilling the Knowledge in a Neural Network',
    authors: ['Hinton, G.', 'Vinyals, O.', 'Dean, J.'],
    year: 2015,
    venue: 'NIPS Deep Learning and Representation Learning Workshop',
    doi: '10.48550/arXiv.1503.02531',
    url: 'https://arxiv.org/abs/1503.02531',
    abstract:
      'Establishes dark-knowledge transfer from heavy ensemble teacher networks to compact student models via temperature-scaled soft probability logits.',
    notes: 'Foundational formulation for logit and feature-based teacher-student distillation.',
    citationCount: 18400,
    createdAt: '2026-01-17T09:15:00.000Z',
  },
];

export const INITIAL_GAPS: GapEntity[] = [
  {
    id: 'g-001',
    code: 'G-001',
    type: 'gap',
    title: 'Deep architectural depth in standard ResNet50 and DenseNet121 incurs high sequential latency unsuited for real-time WCE telemetry.',
    description:
      'Conventional deep networks have large layer depths that create memory read/write latency bottlenecks and high battery consumption during continuous capsule traversal.',
    impactLevel: 'critical',
    status: 'open',
    createdAt: '2026-01-18T10:00:00.000Z',
  },
  {
    id: 'g-002',
    code: 'G-002',
    type: 'gap',
    title: 'Unstructured pruning creates sparse weight matrices that do not translate into real latency reduction on edge micro-accelerators.',
    description:
      'Without structured channel/layer reduction or dedicated hardware sparse engines, theoretical parameter drops do not provide real-world speedups.',
    impactLevel: 'high',
    status: 'open',
    createdAt: '2026-01-18T11:00:00.000Z',
  },
];

export const INITIAL_HYPOTHESES: HypothesisEntity[] = [
  {
    id: 'h-001',
    code: 'H-001',
    type: 'hypothesis',
    title: 'Layer Folding Depth Reduction with Feature Re-use',
    statement:
      'Applying progressive layer folding to collapse sequential residual stages in ResNet50 and DenseNet121 while retaining cross-layer feature re-use will reduce inference latency significantly with negligible loss in diagnostic classification accuracy on Kvasir-Capsule.',
    rationale:
      'Layer folding compresses the sequential pipeline depth while maintaining receptive field representation via fused convolution blocks.',
    expectedOutcome:
      'Substantial reduction in inference latency and model parameter footprint while preserving multi-class lesion recognition sensitivity.',
    status: 'testing',
    confidence: 0.85,
    createdAt: '2026-01-19T13:00:00.000Z',
  },
  {
    id: 'h-002',
    code: 'H-002',
    type: 'hypothesis',
    title: 'Sequential Pruning followed by Logit-and-Feature Distillation',
    statement:
      'Structured L1 filter pruning combined with feature-level knowledge distillation from unpruned DenseNet121 teachers will recover subtle mucosal lesion discrimination lost during aggressive channel removal.',
    rationale:
      'Distillation supervises the intermediate activation maps of the pruned student, compensating for reduced channel capacity.',
    expectedOutcome:
      'Pruned student model matches teacher discrimination thresholds on rare mucosal pathologies.',
    status: 'testing',
    confidence: 0.80,
    createdAt: '2026-01-19T14:30:00.000Z',
  },
];

export const INITIAL_EXPERIMENTS: ExperimentEntity[] = [
  {
    id: 'e-001',
    code: 'E-001',
    type: 'experiment',
    title: 'Baseline Evaluation of Uncompressed VGG16, ResNet50, and DenseNet121 on Kvasir-Capsule',
    description:
      'Establish baseline accuracy, parameter counts, and inference times for full-depth backbone models on standardized Kvasir-Capsule splits.',
    status: 'planned',
    config: {
      models: ['VGG16', 'ResNet50', 'DenseNet121'],
      dataset: 'Kvasir-Capsule',
      imageSize: [224, 224],
      batchSize: 32,
    },
    executionMetadata: {
      hardwareTarget: 'NVIDIA RTX 4090',
      status: 'planned',
    },
    createdAt: '2026-01-20T09:00:00.000Z',
  },
  {
    id: 'e-002',
    code: 'E-002',
    type: 'experiment',
    title: 'Progressive Layer Folding Architecture on ResNet50 Backbone',
    description:
      'Execute layer folding transformation reducing 50-layer depth into folded 18-layer equivalent, measuring representation retention.',
    status: 'planned',
    config: {
      baseModel: 'ResNet50',
      targetDepth: 18,
      dataset: 'Kvasir-Capsule',
    },
    executionMetadata: {
      status: 'planned',
    },
    createdAt: '2026-01-21T10:30:00.000Z',
  },
  {
    id: 'e-003',
    code: 'E-003',
    type: 'experiment',
    title: 'Aggressive Structured Filter Pruning on VGG16',
    description:
      'Evaluate direct structured pruning without recovery distillation to test lower capacity boundary.',
    status: 'planned',
    config: {
      baseModel: 'VGG16',
      pruningRatio: 0.70,
    },
    executionMetadata: {
      status: 'planned',
    },
    createdAt: '2026-01-22T14:00:00.000Z',
  },
  {
    id: 'e-004',
    code: 'E-004',
    type: 'experiment',
    title: 'Layer-Folded Student Distillation from DenseNet121 Teacher',
    description:
      'Planned training of folded compact student model guided by full-precision DenseNet121 teacher logits and intermediate feature maps.',
    status: 'planned',
    config: {
      teacher: 'DenseNet121',
      student: 'Folded-DenseNet-Compact',
    },
    executionMetadata: {
      queuePosition: 1,
      status: 'planned',
    },
    createdAt: '2026-01-23T08:00:00.000Z',
  },
];

export const INITIAL_RESULTS: ResultEntity[] = [
  {
    id: 'r-001',
    code: 'R-001',
    type: 'result',
    title: 'Baseline Accuracy and Latency Profile on Kvasir-Capsule',
    summary:
      'Full ResNet50 achieved 94.2% AUC with 48.2ms per-frame inference on RTX 4090, confirming baseline reference metrics for folded student architectures.',
    metrics: {
      auc: 0.942,
      accuracy: 0.938,
      latencyMs: 48.2,
      parametersM: 25.6,
      f1Score: 0.912,
    },
    experimentId: 'e-001',
    status: 'valid',
    createdAt: '2026-01-24T11:00:00.000Z',
  },
  {
    id: 'r-002',
    code: 'R-002',
    type: 'result',
    title: 'Layer-Folded ResNet18 Latency Speedup and Sensitivity',
    summary:
      'Folded 18-layer equivalent retained 93.1% AUC with inference latency reduced to 16.4ms (2.94x speedup), establishing viability for real-time telemetry.',
    metrics: {
      auc: 0.931,
      accuracy: 0.924,
      latencyMs: 16.4,
      speedup: '2.94x',
      parametersM: 8.9,
    },
    experimentId: 'e-002',
    status: 'valid',
    createdAt: '2026-01-25T14:30:00.000Z',
  },
];

export const INITIAL_DECISIONS: DecisionEntity[] = [
  {
    id: 'd-001',
    code: 'D-001',
    type: 'decision',
    title: 'Adopt Progressive Layer Folding as Core Compression Architecture',
    outcome: 'accepted',
    rationale:
      'Layer folding delivers a 2.94x latency reduction while maintaining >93% AUC on Kvasir-Capsule, outperforming aggressive unstructured pruning.',
    implications:
      'All subsequent distillation pipelines will use the 18-layer folded backbone as primary student architecture.',
    createdAt: '2026-01-26T09:00:00.000Z',
  },
];

export const INITIAL_CLAIMS: ClaimEntity[] = [
  {
    id: 'c-001',
    code: 'C-001',
    type: 'claim',
    title: 'Layer Folding Enables Real-Time WCE Lesion Detection with Preserved Diagnostic AUC',
    statement:
      'Progressive layer folding combined with cross-stage feature re-use reduces convolutional backbone inference latency below 20ms without significant loss in gastrointestinal abnormality classification.',
    confidenceScore: 0.94,
    status: 'verified',
    createdAt: '2026-01-27T10:00:00.000Z',
  },
];

export const INITIAL_RELATIONSHIPS: RelationshipLink[] = [
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
    sourceId: 'p-002',
    targetType: 'gap',
    targetId: 'g-002',
    relationType: 'informs',
    createdAt: '2026-01-17T15:00:00.000Z',
  },
  {
    id: 'rel-03',
    sourceType: 'gap',
    sourceId: 'g-001',
    targetType: 'hypothesis',
    targetId: 'h-001',
    relationType: 'motivates',
    createdAt: '2026-01-18T10:30:00.000Z',
  },
  {
    id: 'rel-04',
    sourceType: 'gap',
    sourceId: 'g-002',
    targetType: 'hypothesis',
    targetId: 'h-002',
    relationType: 'motivates',
    createdAt: '2026-01-18T11:30:00.000Z',
  },
  {
    id: 'rel-05',
    sourceType: 'hypothesis',
    sourceId: 'h-001',
    targetType: 'question',
    targetId: 'q-001',
    relationType: 'addresses',
    createdAt: '2026-01-19T13:30:00.000Z',
  },
  {
    id: 'rel-06',
    sourceType: 'hypothesis',
    sourceId: 'h-002',
    targetType: 'question',
    targetId: 'q-001',
    relationType: 'addresses',
    createdAt: '2026-01-19T14:30:00.000Z',
  },
  {
    id: 'rel-07',
    sourceType: 'experiment',
    sourceId: 'e-001',
    targetType: 'hypothesis',
    targetId: 'h-001',
    relationType: 'tests',
    createdAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'rel-08',
    sourceType: 'experiment',
    sourceId: 'e-002',
    targetType: 'hypothesis',
    targetId: 'h-001',
    relationType: 'tests',
    createdAt: '2026-01-21T10:00:00.000Z',
  },
  {
    id: 'rel-09',
    sourceType: 'experiment',
    sourceId: 'e-003',
    targetType: 'hypothesis',
    targetId: 'h-002',
    relationType: 'tests',
    createdAt: '2026-01-21T11:00:00.000Z',
  },
  {
    id: 'rel-10',
    sourceType: 'experiment',
    sourceId: 'e-004',
    targetType: 'hypothesis',
    targetId: 'h-002',
    relationType: 'tests',
    createdAt: '2026-01-22T08:00:00.000Z',
  },
];
