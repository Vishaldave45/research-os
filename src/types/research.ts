export type EntityType =
  | 'question'
  | 'paper'
  | 'gap'
  | 'hypothesis'
  | 'experiment'
  | 'result'
  | 'decision'
  | 'claim';

export type RelationType =
  | 'cites'
  | 'informs'
  | 'motivates'
  | 'addresses'
  | 'tests'
  | 'supports'
  | 'refutes'
  | 'produces'
  | 'depends_on'
  | 'derived_from'
  | 'validates'
  | 'supersedes';

export interface BaseEntity {
  id: string;
  code: string;
  type: EntityType;
  title: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface ResearchQuestionEntity extends BaseEntity {
  type: 'question';
  description?: string;
  status: 'open' | 'active' | 'resolved' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface PaperEntity extends BaseEntity {
  type: 'paper';
  authors: string[];
  year?: number;
  venue?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  notes?: string;
  citationCount?: number;
}

export interface GapEntity extends BaseEntity {
  type: 'gap';
  description: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'addressed' | 'closed';
}

export interface HypothesisEntity extends BaseEntity {
  type: 'hypothesis';
  statement: string;
  rationale: string;
  expectedOutcome?: string;
  status: 'draft' | 'testing' | 'supported' | 'refuted' | 'abandoned';
  confidence?: number;
}

export interface ExperimentEntity extends BaseEntity {
  type: 'experiment';
  description?: string;
  status: 'planned' | 'running' | 'completed' | 'failed' | 'aborted';
  parameters?: Record<string, any>;
  config?: Record<string, any>;
  executionMetadata?: Record<string, any>;
}

export interface ResultEntity extends BaseEntity {
  type: 'result';
  experimentId?: string;
  summary: string;
  metrics: Record<string, any>;
  artifacts?: Array<{
    type: string;
    title: string;
    url: string;
  }>;
  status: 'provisional' | 'valid' | 'invalidated';
}

export interface DecisionEntity extends BaseEntity {
  type: 'decision';
  outcome: 'accepted' | 'rejected' | 'deferred' | 'superseded';
  rationale: string;
  implications?: string;
}

export interface ClaimEntity extends BaseEntity {
  type: 'claim';
  statement: string;
  confidenceScore: number; // 0.0 to 1.0
  status: 'proposed' | 'verified' | 'disputed' | 'retracted';
}

export type ResearchEntity =
  | ResearchQuestionEntity
  | PaperEntity
  | GapEntity
  | HypothesisEntity
  | ExperimentEntity
  | ResultEntity
  | DecisionEntity
  | ClaimEntity;

export interface RelationshipLink {
  id: string;
  sourceType: EntityType;
  sourceId: string;
  targetType: EntityType;
  targetId: string;
  relationType: RelationType;
  description?: string;
  notes?: string;
  confidence?: number;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  slug?: string;
  updatedAt?: string;
  primaryQuestion?: string;
}

export interface ResearchDataset {
  workspace?: Workspace;
  questions: ResearchQuestionEntity[];
  papers: PaperEntity[];
  gaps: GapEntity[];
  hypotheses: HypothesisEntity[];
  experiments: ExperimentEntity[];
  results: ResultEntity[];
  decisions: DecisionEntity[];
  claims: ClaimEntity[];
  relationships: RelationshipLink[];
}

export interface ProjectSummary {
  questionsCount: number;
  papersCount: number;
  gapsCount: number;
  hypothesesCount: number;
  experimentsCount: number;
  resultsCount: number;
  decisionsCount: number;
  claimsCount: number;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  researchArea?: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt?: string;
  summary?: ProjectSummary;
}

export type WorkspaceViewMode =
  | 'overview'
  | 'projects'
  | 'members'
  | 'settings';

export type ProjectViewMode =
  | 'overview'
  | 'questions'
  | 'papers'
  | 'gaps'
  | 'hypotheses'
  | 'experiments'
  | 'results'
  | 'decisions'
  | 'claims'
  | 'traceability';

export type ViewMode =
  | 'canvas'
  | 'matrix'
  | 'gaps'
  | 'benchmarks'
  | 'manuscript'
  | 'claims'
  | 'evidence_narrative'
  | 'table'
  | WorkspaceViewMode
  | ProjectViewMode;

export interface BenchmarkRun {
  id: string;
  code: string;
  name: string;
  experimentId: string;
  hypothesisId?: string;
  resultId?: string;
  baseline: boolean;
  paretoOptimal?: boolean;
  status: 'completed' | 'running' | 'failed';
  gitCommit: string;
  hardware: {
    device: string;
    vram: string;
    powerCapWatts?: number;
  };
  hyperparameters: Record<string, any>;
  metrics: {
    accuracy?: number; // e.g. 84.1 or 0.841
    primaryMetricLabel: string;
    primaryMetricValue: number;
    latencyMs: number;
    flopsG: number;
    memoryMb: number;
    powerWatts?: number;
    throughputTokensOrFps?: number;
    [key: string]: any;
  };
  lossConvergence?: Array<{
    epochOrStep: number;
    trainLoss: number;
    valLoss: number;
    metricValue: number;
  }>;
  createdAt: string;
}

export interface LiteratureMatrixRow {
  paperId: string;
  paperCode: string;
  paperTitle: string;
  authors: string;
  year?: number;
  venue?: string;
  methodology: string;
  keyMetrics: Record<string, any>;
  strengths: string[];
  limitations: string[];
}

export interface DiscoveredGapProposal {
  title: string;
  description: string;
  impactLevel: 'critical' | 'high' | 'medium' | 'low';
  motivatingPaperCodes: string[];
  proposedHypothesis: string;
  recommendedExperimentProtocol: string;
}

export interface ClaimValidationAudit {
  claimId: string;
  claimCode: string;
  claimStatement: string;
  currentStatus: string;
  evidentiaryScore: number;
  supportLevel: 'strongly_supported' | 'partially_supported' | 'unsupported' | 'contradicted';
  supportingResults: Array<{
    id: string;
    code: string;
    title: string;
    summary: string;
    metrics: Record<string, any>;
    status?: string;
  }>;
  contradictingResults: Array<{
    id: string;
    code: string;
    title: string;
    summary: string;
    metrics: Record<string, any>;
  }>;
  citingPapers: Array<{
    id: string;
    code: string;
    title: string;
    year?: number;
    venue?: string;
  }>;
  validationCritique: string;
  recommendedActions: string[];
}

export type CanvasLayoutMode = 'pipeline' | 'grouped' | 'freeform';
