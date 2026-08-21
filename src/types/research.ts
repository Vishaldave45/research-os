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
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
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

export type ViewMode = 'canvas' | 'matrix' | 'gaps' | 'claims' | 'evidence_narrative' | 'table';
export type CanvasLayoutMode = 'pipeline' | 'grouped' | 'freeform';
