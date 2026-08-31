import {
  ResearchDataset,
  RelationshipLink,
  EntityType,
  RelationType,
} from '../types/research';
import { canonicalWceDataset } from './canonicalWceData';

export interface DomainTemplate {
  id: string;
  name: string;
  domainName: string;
  icon: string;
  badgeColor: string;
  description: string;
  dataset: ResearchDataset;
}

// Helper to construct fully-typed relationship links
const createRel = (
  id: string,
  sourceId: string,
  sourceType: EntityType,
  targetId: string,
  targetType: EntityType,
  relationType: RelationType,
  description?: string
): RelationshipLink => ({
  id,
  sourceId,
  sourceType,
  targetId,
  targetType,
  relationType,
  description,
  createdAt: '2026-02-01T00:00:00.000Z',
});

// Template 2: NLP & Large Language Models
const nlpDataset: ResearchDataset = {
  workspace: {
    id: 'ws-distil-reason',
    name: 'DistilReason Lab',
    slug: 'distil-reason',
    description: 'Investigating parameter-efficient reasoning distillation and KV-cache compression for edge LLMs',
    primaryQuestion: 'Can 4-bit KV-cache quantization retain multi-step mathematical reasoning in 7B-parameter models?',
    createdAt: '2026-02-10T08:00:00.000Z',
  },
  questions: [
    {
      id: 'q-nlp-01',
      code: 'RQ-001',
      type: 'question',
      title: 'Can 4-bit quantized KV-cache maintain chain-of-thought reasoning fidelity in sub-8B LLMs?',
      description:
        'Context window expansion in transformer models leads to excessive GPU memory consumption. We investigate if asymmetric FP4 key-value cache quantization preserves multi-step mathematical derivations on GSM8K.',
      status: 'active',
      priority: 'critical',
      createdAt: '2026-02-10T08:00:00Z',
      metadata: { domain: 'NLP / LLM Reasoning', leadResearcher: 'Dr. Elena Rostova' },
    },
    {
      id: 'q-nlp-02',
      code: 'RQ-002',
      type: 'question',
      title: 'What is the optimal LoRA rank allocation across attention heads versus MLP projections for math reasoning?',
      description:
        'Standard uniform LoRA ranks (r=16) across all layers waste capacity on early lexical heads. We evaluate dynamic rank allocation targeted at middle-to-late reasoning layers.',
      status: 'active',
      priority: 'high',
      createdAt: '2026-02-14T10:30:00Z',
      metadata: { domain: 'NLP / Model Optimization' },
    },
  ],
  papers: [
    {
      id: 'p-nlp-01',
      code: 'P-101',
      type: 'paper',
      title: 'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning',
      authors: ['Dao, T.'],
      year: 2023,
      venue: 'ICLR 2024',
      doi: '10.48550/arXiv.2307.08691',
      url: 'https://arxiv.org/abs/2307.08691',
      abstract: 'Optimizes IO-awareness in attention calculation, achieving 2x speedup over standard attention.',
      citationCount: 1420,
      createdAt: '2026-02-11T09:00:00Z',
    },
    {
      id: 'p-nlp-02',
      code: 'P-102',
      type: 'paper',
      title: 'KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache',
      authors: ['Liu, Z.', 'Yuan, J.', 'Jin, H.', 'Zhong, S.'],
      year: 2024,
      venue: 'ICML 2024',
      doi: '10.48550/arXiv.2402.02750',
      url: 'https://arxiv.org/abs/2402.02750',
      abstract: 'Demonstrates per-channel key quantization and per-token value quantization to compress long-context memory.',
      citationCount: 185,
      createdAt: '2026-02-12T11:00:00Z',
    },
  ],
  gaps: [
    {
      id: 'g-nlp-01',
      code: 'G-001',
      type: 'gap',
      title: 'Severe perplexity degradation on multi-hop symbolic derivations below 4-bit KV precision',
      description:
        'While conversational benchmarks (MT-Bench) tolerate 2-bit quantization, formal proof chains and GSM8K math reasoning collapse due to outlier key activation truncation.',
      impactLevel: 'critical',
      status: 'open',
      createdAt: '2026-02-15T14:00:00Z',
    },
  ],
  hypotheses: [
    {
      id: 'h-nlp-01',
      code: 'H-001',
      type: 'hypothesis',
      title: 'Asymmetric FP4 with Outlier-Protected Tokens maintains >98% of GSM8K baseline accuracy',
      statement:
        'Preserving top-0.5% outlier magnitude attention keys in full FP16 while quantizing the remaining 99.5% to FP4 will prevent attention entropy collapse during multi-step reasoning.',
      rationale: 'Outlier tokens encode structural syntax and variable binding indices necessary for arithmetic deduction.',
      status: 'supported',
      confidence: 0.92,
      createdAt: '2026-02-16T15:00:00Z',
    },
  ],
  experiments: [
    {
      id: 'e-nlp-01',
      code: 'E-001',
      type: 'experiment',
      title: 'GSM8K and MATH-500 Evaluation of FP4-KV LLaMA-3-8B',
      description:
        'Benchmarked 8-shot chain-of-thought generation across 1,319 GSM8K problems comparing standard INT4, KIVI 2-bit, and Outlier-Protected FP4.',
      status: 'completed',
      parameters: {
        model: 'Meta-Llama-3-8B-Instruct',
        contextLength: '8,192 tokens',
        gpu: '1x NVIDIA RTX 4090 24GB',
        quantization: 'Asymmetric FP4 (E2M1)',
        outlierPercentile: '99.5th',
      },
      createdAt: '2026-02-18T09:00:00Z',
    },
  ],
  results: [
    {
      id: 'r-nlp-01',
      code: 'R-001',
      type: 'result',
      title: '83.4% GSM8K Accuracy with 3.92x Memory Compression',
      summary:
        'Outlier-protected FP4 KV cache reached 83.4% pass@1 on GSM8K (baseline FP16: 84.1%), saving 18.2 GB VRAM on 8k context tokens without throughput penalty.',
      metrics: {
        gsm8kPass1: '83.4%',
        baselinePass1: '84.1%',
        math500Accuracy: '46.8%',
        kvCacheSize8k: '4.8 GB (vs 18.8 GB)',
        compressionRatio: '3.92x',
        tokensPerSecond: '64.2 tok/s',
      },
      status: 'valid',
      createdAt: '2026-02-20T12:00:00Z',
    },
  ],
  decisions: [
    {
      id: 'd-nlp-01',
      code: 'D-001',
      type: 'decision',
      title: 'Adopt Outlier-Protected FP4 for production 8B serving engine',
      outcome: 'accepted',
      rationale:
        'The minor 0.7% drop in GSM8K pass@1 is fully justified by the 3.92x reduction in per-user KV memory footprint, allowing 4x concurrent batch sizes on a single 24GB GPU.',
      implications: 'Update inference serving runtime vLLM configuration with the outlier protection mask.',
      createdAt: '2026-02-22T14:30:00Z',
    },
  ],
  claims: [
    {
      id: 'c-nlp-01',
      code: 'C-001',
      type: 'claim',
      title: 'Asymmetric 4-bit KV quantization preserves mathematical reasoning with <1% accuracy loss',
      statement:
        'Outlier-protected asymmetric 4-bit KV caching reduces memory requirements by 74.5% while sustaining over 99% of full-precision mathematical deduction capabilities on LLaMA-3-8B.',
      confidenceScore: 0.94,
      status: 'verified',
      metadata: { publicationTarget: 'ACL 2026 / EMNLP' },
      createdAt: '2026-02-23T09:00:00Z',
    },
  ],
  relationships: [
    createRel('rel-nlp-1', 'p-nlp-01', 'paper', 'q-nlp-01', 'question', 'informs'),
    createRel('rel-nlp-2', 'p-nlp-02', 'paper', 'g-nlp-01', 'gap', 'informs'),
    createRel('rel-nlp-3', 'g-nlp-01', 'gap', 'h-nlp-01', 'hypothesis', 'derived_from'),
    createRel('rel-nlp-4', 'h-nlp-01', 'hypothesis', 'e-nlp-01', 'experiment', 'tests'),
    createRel('rel-nlp-5', 'e-nlp-01', 'experiment', 'r-nlp-01', 'result', 'produces'),
    createRel('rel-nlp-6', 'r-nlp-01', 'result', 'd-nlp-01', 'decision', 'supports'),
    createRel('rel-nlp-7', 'd-nlp-01', 'decision', 'c-nlp-01', 'claim', 'validates'),
  ],
};

// Template 3: Robotics & Embodied AI
const roboticsDataset: ResearchDataset = {
  workspace: {
    id: 'ws-dexterous-policy',
    name: 'DexterousPolicy Lab',
    slug: 'dexterous-policy',
    description: 'Diffusion policy optimization for multi-finger robotic tactile manipulation',
    primaryQuestion: 'Can tactile-conditioned diffusion policies achieve 95%+ success in slippery object reorientation?',
    createdAt: '2026-01-20T08:00:00.000Z',
  },
  questions: [
    {
      id: 'q-rob-01',
      code: 'RQ-001',
      type: 'question',
      title: 'How does high-frequency tactile feedback improve diffusion policy stability during in-hand object rotation?',
      description:
        'Vision-only policies suffer from occlusion during multi-finger in-hand manipulation. We study coupling 100Hz GelSight tactile arrays with a denoising diffusion policy.',
      status: 'active',
      priority: 'critical',
      createdAt: '2026-01-20T08:00:00Z',
      metadata: { domain: 'Robotics / Tactile AI', hardware: 'Allegro Hand + GelSight Mini' },
    },
  ],
  papers: [
    {
      id: 'p-rob-01',
      code: 'P-101',
      type: 'paper',
      title: 'Diffusion Policy: Visuomotor Policy Learning via Action Diffusion',
      authors: ['Chi, C.', 'Feng, S.', 'Pan, Y.', 'Song, S.'],
      year: 2023,
      venue: 'Robotics: Science and Systems (RSS)',
      doi: '10.48550/arXiv.2303.04137',
      url: 'https://arxiv.org/abs/2303.04137',
      abstract: 'Formulates robot visuomotor policy generation as a conditional denoising diffusion process.',
      citationCount: 620,
      createdAt: '2026-01-21T09:00:00Z',
    },
  ],
  gaps: [
    {
      id: 'g-rob-01',
      code: 'G-001',
      type: 'gap',
      title: 'Inference latency bottleneck of standard DDPM diffusion steps for fast closed-loop slip recovery',
      description:
        'Iterative 100-step DDPM diffusion takes 120ms per action chunk, too slow to prevent object slip during sudden torque variations.',
      impactLevel: 'critical',
      status: 'open',
      createdAt: '2026-01-25T10:00:00Z',
    },
  ],
  hypotheses: [
    {
      id: 'h-rob-01',
      code: 'H-001',
      type: 'hypothesis',
      title: 'Consistency Policy Distillation enables 50Hz reactive tactile control without policy degradation',
      statement:
        'Distilling the multi-step diffusion policy into a 4-step consistency trajectory model preserves multi-modal action distributions while reducing inference latency to <20ms.',
      rationale: 'Consistency models enforce self-consistency along ODE trajectories, allowing single/few-step generation.',
      status: 'supported',
      confidence: 0.95,
      createdAt: '2026-01-28T11:00:00Z',
    },
  ],
  experiments: [
    {
      id: 'e-rob-01',
      code: 'E-001',
      type: 'experiment',
      title: 'Physical In-Hand Reorientation Benchmark on Allegro Hand',
      description:
        'Tested 200 physical reorientations across 8 diverse objects (cylinders, spheres, cubes, non-convex mugs) under external friction perturbations.',
      status: 'completed',
      parameters: {
        robot: 'Allegro Hand (16 DoF)',
        sensors: '3x GelSight Mini tactile arrays',
        diffusionSteps: '4 steps (Consistency Distilled)',
        controlRate: '50 Hz',
      },
      createdAt: '2026-02-01T12:00:00Z',
    },
  ],
  results: [
    {
      id: 'r-rob-01',
      code: 'R-001',
      type: 'result',
      title: '96.5% In-Hand Reorientation Success at 55Hz Control Rate',
      summary:
        'The 4-step consistency policy achieved 96.5% success across 200 trials (vs 97.0% for 100-step DDPM), cutting control loop latency from 124ms to 17.8ms.',
      metrics: {
        successRate: '96.5%',
        baselineSuccessRate: '97.0%',
        controlFrequency: '55.2 Hz',
        meanLatency: '17.8 ms',
        slipRecoveries: '94.2%',
      },
      status: 'valid',
      createdAt: '2026-02-05T14:00:00Z',
    },
  ],
  decisions: [
    {
      id: 'd-rob-01',
      code: 'D-001',
      type: 'decision',
      title: 'Deploy Consistency Distillation as core real-time policy architecture',
      outcome: 'accepted',
      rationale:
        'The 7x reduction in latency achieves sub-20ms closed-loop tactile reactivity, eliminating drop failures caused by visual occlusion.',
      implications: 'Standardize all manipulation policy pipelines on 4-step consistency distillation.',
      createdAt: '2026-02-08T15:00:00Z',
    },
  ],
  claims: [
    {
      id: 'c-rob-01',
      code: 'C-001',
      type: 'claim',
      title: 'Tactile Consistency Policies achieve 50Hz in-hand reorientation with 96%+ reliability',
      statement:
        'By coupling GelSight tactile feedback with 4-step consistency trajectory distillation, robotic hands can perform slip-resilient object reorientation in real time on edge hardware.',
      confidenceScore: 0.95,
      status: 'verified',
      metadata: { publicationTarget: 'ICRA 2026 / CoRL' },
      createdAt: '2026-02-10T16:00:00Z',
    },
  ],
  relationships: [
    createRel('rel-rob-1', 'p-rob-01', 'paper', 'q-rob-01', 'question', 'informs'),
    createRel('rel-rob-2', 'q-rob-01', 'question', 'g-rob-01', 'gap', 'informs'),
    createRel('rel-rob-3', 'g-rob-01', 'gap', 'h-rob-01', 'hypothesis', 'derived_from'),
    createRel('rel-rob-4', 'h-rob-01', 'hypothesis', 'e-rob-01', 'experiment', 'tests'),
    createRel('rel-rob-5', 'e-rob-01', 'experiment', 'r-rob-01', 'result', 'produces'),
    createRel('rel-rob-6', 'r-rob-01', 'result', 'd-rob-01', 'decision', 'supports'),
    createRel('rel-rob-7', 'd-rob-01', 'decision', 'c-rob-01', 'claim', 'validates'),
  ],
};

// Template 4: Computational Biology & Drug Discovery
const bioDataset: ResearchDataset = {
  workspace: {
    id: 'ws-bio-affinity',
    name: 'BioAffinity Lab',
    slug: 'bio-affinity',
    description: 'Equivariant Graph Neural Networks for small molecule protein-ligand binding affinity prediction',
    primaryQuestion: 'Can SE(3)-equivariant point cloud GNNs achieve sub-0.5 kcal/mol binding affinity error?',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  questions: [
    {
      id: 'q-bio-01',
      code: 'RQ-001',
      type: 'question',
      title: 'Can geometric SE(3)-equivariant representations overcome coordinate sensitivity in ligand docking scoring?',
      description:
        'Traditional empirical scoring functions (AutoDock Vina) struggle with non-covalent polar pocket interactions. We investigate equivariant coordinate convolution.',
      status: 'active',
      priority: 'critical',
      createdAt: '2026-01-10T08:00:00Z',
      metadata: { domain: 'Bioinformatics / Drug Discovery' },
    },
  ],
  papers: [
    {
      id: 'p-bio-01',
      code: 'P-101',
      type: 'paper',
      title: 'Equivariant Graph Neural Networks',
      authors: ['Satorras, V. G.', 'Hoogeboom, E.', 'Welling, M.'],
      year: 2021,
      venue: 'ICML 2021',
      doi: '10.48550/arXiv.2102.09844',
      url: 'https://arxiv.org/abs/2102.09844',
      abstract: 'Introduces E(n)-equivariant graph neural networks that naturally preserve 3D rotations, translations, and reflections.',
      citationCount: 890,
      createdAt: '2026-01-11T09:00:00Z',
    },
  ],
  gaps: [
    {
      id: 'g-bio-01',
      code: 'G-001',
      type: 'gap',
      title: 'Neglect of side-chain flexibility in rigid receptor affinity predictors',
      description:
        'Most deep learning scoring models assume static crystal pocket coordinates, failing when induced-fit conformational changes alter hydrophobic cavity geometry.',
      impactLevel: 'high',
      status: 'open',
      createdAt: '2026-01-18T10:00:00Z',
    },
  ],
  hypotheses: [
    {
      id: 'h-bio-01',
      code: 'H-001',
      type: 'hypothesis',
      title: 'Dynamic pocket ensemble convolution reduces binding free energy RMSE below 0.48 kcal/mol on PDBbind',
      statement:
        'Sampling 10 ps molecular dynamics side-chain ensembles coupled with equivariant vector message passing will improve Pearson r correlation over AutoDock Vina by >= 0.22.',
      rationale: 'Receptor flexibility prevents steric clash penalties on high-affinity flexible drug candidates.',
      status: 'supported',
      confidence: 0.93,
      createdAt: '2026-01-22T11:00:00Z',
    },
  ],
  experiments: [
    {
      id: 'e-bio-01',
      code: 'E-001',
      type: 'experiment',
      title: 'Equivariant Binding Affinity Benchmark on PDBbind v2020 Core Set',
      description:
        'Evaluated SE(3)-equivariant network with ensemble side-chain sampling on 290 diverse protein-ligand complexes.',
      status: 'completed',
      parameters: {
        dataset: 'PDBbind v2020 Core Set (290 complexes)',
        model: 'SE(3)-EnsembleEGNN (6 layers)',
        conformations: 8,
        baseline: 'AutoDock Vina + GNINA',
      },
      createdAt: '2026-01-28T12:00:00Z',
    },
  ],
  results: [
    {
      id: 'r-bio-01',
      code: 'R-001',
      type: 'result',
      title: 'Pearson r = 0.842 and RMSE = 0.461 kcal/mol on PDBbind Core',
      summary:
        'The SE(3) ensemble network outperformed AutoDock Vina (r=0.612, RMSE=1.28 kcal/mol) and GNINA (r=0.744), showing superior generalizability across kinase and GPCR pockets.',
      metrics: {
        pearsonR: '0.842',
        rmseKcalMol: '0.461 kcal/mol',
        vinaPearsonR: '0.612',
        vinaRmse: '1.28 kcal/mol',
        pocketInferenceTime: '4.2 ms',
      },
      status: 'valid',
      createdAt: '2026-02-04T14:00:00Z',
    },
  ],
  decisions: [
    {
      id: 'd-bio-01',
      code: 'D-001',
      type: 'decision',
      title: 'Integrate SE(3)-EnsembleEGNN into virtual screening pipeline',
      outcome: 'accepted',
      rationale:
        'The 4.2ms inference speed allows screening 1M compounds in under 70 minutes with experimental-grade binding free energy correlation.',
      implications: 'Replace classical empirical scoring in the high-throughput kinase inhibitor screen.',
      createdAt: '2026-02-07T15:00:00Z',
    },
  ],
  claims: [
    {
      id: 'c-bio-01',
      code: 'C-001',
      type: 'claim',
      title: 'Equivariant ensemble message passing achieves sub-0.5 kcal/mol binding affinity accuracy',
      statement:
        'Accounting for receptor side-chain dynamics with SE(3)-equivariant graph neural networks increases virtual screening hit rates by 3.2x compared to rigid docking baselines.',
      confidenceScore: 0.96,
      status: 'verified',
      metadata: { publicationTarget: 'Nature Biotechnology / J. Chem. Inf. Model.' },
      createdAt: '2026-02-09T16:00:00Z',
    },
  ],
  relationships: [
    createRel('rel-bio-1', 'p-bio-01', 'paper', 'q-bio-01', 'question', 'informs'),
    createRel('rel-bio-2', 'q-bio-01', 'question', 'g-bio-01', 'gap', 'informs'),
    createRel('rel-bio-3', 'g-bio-01', 'gap', 'h-bio-01', 'hypothesis', 'derived_from'),
    createRel('rel-bio-4', 'h-bio-01', 'hypothesis', 'e-bio-01', 'experiment', 'tests'),
    createRel('rel-bio-5', 'e-bio-01', 'experiment', 'r-bio-01', 'result', 'produces'),
    createRel('rel-bio-6', 'r-bio-01', 'result', 'd-bio-01', 'decision', 'supports'),
    createRel('rel-bio-7', 'd-bio-01', 'decision', 'c-bio-01', 'claim', 'validates'),
  ],
};

export const DOMAIN_TEMPLATES: DomainTemplate[] = [
  {
    id: 'wce-vision-ai',
    name: 'Biomedical & Vision AI (DepthReduce)',
    domainName: 'Medical Imaging / Edge AI',
    icon: 'BrainCircuit',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Wireless capsule endoscopy model compression, layer folding, spatial patch pruning, and 2.1W edge thermal limits.',
    dataset: canonicalWceDataset,
  },
  {
    id: 'nlp-llm-distil',
    name: 'NLP & LLM Distillation (DistilReason)',
    domainName: 'NLP / Reasoning Models',
    icon: 'MessageSquareText',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: '4-bit KV-cache quantization, LoRA rank allocation, and chain-of-thought mathematical reasoning benchmarks.',
    dataset: nlpDataset,
  },
  {
    id: 'robotics-tactile',
    name: 'Robotics & Embodied AI (DexterousPolicy)',
    domainName: 'Robotics / Reinforcement Learning',
    icon: 'Bot',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'GelSight tactile-conditioned diffusion policies, consistency distillation, and sub-20ms in-hand manipulation.',
    dataset: roboticsDataset,
  },
  {
    id: 'bio-drug-affinity',
    name: 'Computational Biology (BioAffinity)',
    domainName: 'Bioinformatics / Structural Biology',
    icon: 'Dna',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'SE(3)-equivariant graph neural networks for protein-ligand binding free energy prediction on PDBbind.',
    dataset: bioDataset,
  },
];
