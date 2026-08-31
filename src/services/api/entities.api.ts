import { apiClient } from './client';
import {
  ResearchQuestionEntity,
  PaperEntity,
  GapEntity,
  HypothesisEntity,
  ExperimentEntity,
  ResultEntity,
  DecisionEntity,
  ClaimEntity,
  EvidenceEntity,
  DatasetEntity,
  ModelEntity,
  ResearchDomain,
  RelationshipLink,
} from '../../types/research';

function mapQuestion(q: any): ResearchQuestionEntity {
  return {
    id: q.id,
    code: q.code,
    type: 'question',
    title: q.title,
    description: q.description,
    status: q.status || 'open',
    priority: q.priority || 'medium',
    createdAt: q.created_at || q.createdAt || new Date().toISOString(),
    updatedAt: q.updated_at || q.updatedAt,
    metadata: q.metadata || {},
  };
}

function mapPaper(p: any): PaperEntity {
  return {
    id: p.id,
    code: p.code,
    type: 'paper',
    title: p.title,
    authors: Array.isArray(p.authors) ? p.authors : (typeof p.authors === 'string' ? p.authors.split(',').map((s: string) => s.trim()) : []),
    year: p.year,
    venue: p.venue,
    doi: p.doi,
    url: p.url,
    abstract: p.abstract,
    notes: p.notes,
    citationCount: p.citation_count || p.citationCount,
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    updatedAt: p.updated_at || p.updatedAt,
    metadata: p.metadata || {},
  };
}

function mapGap(g: any): GapEntity {
  return {
    id: g.id,
    code: g.code,
    type: 'gap',
    title: g.title,
    description: g.description,
    impactLevel: g.impact_level || g.impactLevel || 'high',
    status: g.status || 'open',
    createdAt: g.created_at || g.createdAt || new Date().toISOString(),
    updatedAt: g.updated_at || g.updatedAt,
    metadata: g.metadata || {},
  };
}

function mapHypothesis(h: any): HypothesisEntity {
  return {
    id: h.id,
    code: h.code,
    type: 'hypothesis',
    title: h.title || h.statement || '',
    statement: h.statement || h.title || '',
    rationale: h.rationale || '',
    expectedOutcome: h.expected_outcome || h.expectedOutcome,
    status: h.status || 'draft',
    confidence: h.confidence ?? 0.85,
    createdAt: h.created_at || h.createdAt || new Date().toISOString(),
    updatedAt: h.updated_at || h.updatedAt,
    metadata: h.metadata || {},
  };
}

function mapExperiment(e: any): ExperimentEntity {
  return {
    id: e.id,
    code: e.code,
    type: 'experiment',
    title: e.title,
    description: e.description,
    status: e.status || 'planned',
    config: e.config || {},
    executionMetadata: e.execution_metadata || e.executionMetadata || {},
    createdAt: e.created_at || e.createdAt || new Date().toISOString(),
    updatedAt: e.updated_at || e.updatedAt,
    metadata: e.metadata || {},
  };
}

function mapResult(r: any): ResultEntity {
  return {
    id: r.id,
    code: r.code,
    type: 'result',
    title: r.title,
    experimentId: r.experiment_id || r.experimentId,
    summary: r.summary || '',
    metrics: r.metrics || {},
    artifacts: r.artifacts || [],
    status: r.status || 'valid',
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    updatedAt: r.updated_at || r.updatedAt,
    metadata: r.metadata || {},
  };
}

function mapDecision(d: any): DecisionEntity {
  return {
    id: d.id,
    code: d.code,
    type: 'decision',
    title: d.title,
    outcome: d.outcome || 'accepted',
    rationale: d.rationale || '',
    implications: d.implications,
    createdAt: d.created_at || d.createdAt || new Date().toISOString(),
    updatedAt: d.updated_at || d.updatedAt,
    metadata: d.metadata || {},
  };
}

function mapEvidence(e: any): EvidenceEntity {
  return {
    id: e.id,
    code: e.code,
    type: 'evidence',
    title: e.title,
    summary: e.summary || '',
    evidenceType: e.evidence_type || e.evidenceType || 'empirical',
    strength: e.strength || 'moderate',
    sourceType: e.source_type || e.sourceType || 'paper',
    sourceId: e.source_id || e.sourceId,
    citationDoi: e.citation_doi || e.citationDoi,
    confidenceScore: e.confidence_score !== undefined ? e.confidence_score : (e.confidenceScore !== undefined ? e.confidenceScore : 70),
    createdAt: e.created_at || e.createdAt || new Date().toISOString(),
    updatedAt: e.updated_at || e.updatedAt,
    metadata: e.metadata_json || e.metadata || {},
  };
}

function mapDomain(d: any): ResearchDomain {
  return {
    id: d.id,
    workspaceId: d.workspace_id || d.workspaceId,
    name: d.name,
    slug: d.slug,
    description: d.description,
    colorBadge: d.color_badge || d.colorBadge || 'blue',
    icon: d.icon || 'Layers',
    projectCount: d.project_count || d.projectCount || 0,
    createdAt: d.created_at || d.createdAt || new Date().toISOString(),
    updatedAt: d.updated_at || d.updatedAt || new Date().toISOString(),
  };
}

function mapClaim(c: any): ClaimEntity {
  return {
    id: c.id,
    code: c.code,
    type: 'claim',
    title: c.title || c.statement || '',
    statement: c.statement || c.title || '',
    confidenceScore: c.confidence_score !== undefined ? c.confidence_score : (c.confidenceScore !== undefined ? c.confidenceScore : 0.9),
    status: c.status || 'verified',
    createdAt: c.created_at || c.createdAt || new Date().toISOString(),
    updatedAt: c.updated_at || c.updatedAt,
    metadata: c.metadata || {},
  };
}

function mapDataset(d: any): DatasetEntity {
  return {
    id: d.id,
    code: d.slug || d.id,
    type: 'dataset',
    title: d.name,
    version: d.version || '1.0.0',
    modality: d.modality || 'image',
    description: d.description,
    sourceUrl: d.source_url || d.sourceUrl,
    license: d.license,
    sampleCount: d.sample_count || d.sampleCount,
    sizeBytes: d.size_bytes || d.sizeBytes,
    preprocessingSpec: d.preprocessing_spec || d.preprocessingSpec || {},
    splitSpec: d.split_spec || d.splitSpec || {},
    createdAt: d.created_at || d.createdAt || new Date().toISOString(),
    updatedAt: d.updated_at || d.updatedAt,
    metadata: d.metadata_json || d.metadata || {},
  };
}

function mapModel(m: any): ModelEntity {
  return {
    id: m.id,
    code: m.slug || m.id,
    type: 'model',
    title: m.name,
    version: m.version || '1.0.0',
    architecture: m.architecture,
    framework: m.framework || 'pytorch',
    parameterCount: m.parameter_count || m.parameterCount,
    checkpointUrl: m.checkpoint_url || m.checkpointUrl,
    codeCommitHash: m.code_commit_hash || m.codeCommitHash,
    description: m.description,
    hyperparameters: m.hyperparameters || {},
    createdAt: m.created_at || m.createdAt || new Date().toISOString(),
    updatedAt: m.updated_at || m.updatedAt,
    metadata: m.metadata_json || m.metadata || {},
  };
}

export const entitiesApi = {
  // Questions
  async listQuestions(): Promise<ResearchQuestionEntity[]> {
    const data = await apiClient.get<any[]>('/questions');
    return data.map(mapQuestion);
  },
  async createQuestion(data: Partial<ResearchQuestionEntity>): Promise<ResearchQuestionEntity> {
    const payload = {
      code: data.code,
      title: data.title,
      description: data.description,
      status: data.status,
      metadata: data.metadata,
    };
    const res = await apiClient.post('/questions', payload);
    return mapQuestion(res);
  },
  async updateQuestion(id: string, data: Partial<ResearchQuestionEntity>): Promise<ResearchQuestionEntity> {
    const payload = {
      title: data.title,
      description: data.description,
      status: data.status,
      metadata: data.metadata,
    };
    const res = await apiClient.put(`/questions/${id}`, payload);
    return mapQuestion(res);
  },
  async deleteQuestion(id: string): Promise<void> {
    return apiClient.delete(`/questions/${id}`);
  },

  // Papers
  async listPapers(): Promise<PaperEntity[]> {
    const data = await apiClient.get<any[]>('/papers');
    return data.map(mapPaper);
  },
  async createPaper(data: Partial<PaperEntity>): Promise<PaperEntity> {
    const payload = {
      code: data.code,
      title: data.title,
      authors: data.authors,
      year: data.year,
      venue: data.venue,
      doi: data.doi,
      url: data.url,
      abstract: data.abstract,
      notes: data.notes,
      metadata: data.metadata,
    };
    const res = await apiClient.post('/papers', payload);
    return mapPaper(res);
  },
  async updatePaper(id: string, data: Partial<PaperEntity>): Promise<PaperEntity> {
    const payload = {
      title: data.title,
      authors: data.authors,
      year: data.year,
      venue: data.venue,
      doi: data.doi,
      url: data.url,
      abstract: data.abstract,
      notes: data.notes,
      metadata: data.metadata,
    };
    const res = await apiClient.put(`/papers/${id}`, payload);
    return mapPaper(res);
  },
  async deletePaper(id: string): Promise<void> {
    return apiClient.delete(`/papers/${id}`);
  },

  // Gaps
  async listGaps(): Promise<GapEntity[]> {
    const data = await apiClient.get<any[]>('/gaps');
    return data.map(mapGap);
  },
  async createGap(data: Partial<GapEntity>): Promise<GapEntity> {
    const payload = {
      code: data.code,
      title: data.title,
      description: data.description,
      impact_level: data.impactLevel,
      status: data.status,
      metadata: data.metadata,
    };
    const res = await apiClient.post('/gaps', payload);
    return mapGap(res);
  },
  async updateGap(id: string, data: Partial<GapEntity>): Promise<GapEntity> {
    const payload = {
      title: data.title,
      description: data.description,
      impact_level: data.impactLevel,
      status: data.status,
      metadata: data.metadata,
    };
    const res = await apiClient.put(`/gaps/${id}`, payload);
    return mapGap(res);
  },
  async deleteGap(id: string): Promise<void> {
    return apiClient.delete(`/gaps/${id}`);
  },

  // Hypotheses
  async listHypotheses(): Promise<HypothesisEntity[]> {
    const data = await apiClient.get<any[]>('/hypotheses');
    return data.map(mapHypothesis);
  },
  async createHypothesis(data: Partial<HypothesisEntity>): Promise<HypothesisEntity> {
    const payload = {
      code: data.code,
      statement: data.statement || data.title,
      rationale: data.rationale,
      expected_outcome: data.expectedOutcome,
      status: data.status,
      confidence: data.confidence,
      metadata: data.metadata,
    };
    const res = await apiClient.post('/hypotheses', payload);
    return mapHypothesis(res);
  },
  async updateHypothesis(id: string, data: Partial<HypothesisEntity>): Promise<HypothesisEntity> {
    const payload = {
      statement: data.statement || data.title,
      rationale: data.rationale,
      expected_outcome: data.expectedOutcome,
      status: data.status,
      metadata: data.metadata,
    };
    const res = await apiClient.put(`/hypotheses/${id}`, payload);
    return mapHypothesis(res);
  },
  async deleteHypothesis(id: string): Promise<void> {
    return apiClient.delete(`/hypotheses/${id}`);
  },

  // Experiments
  async listExperiments(): Promise<ExperimentEntity[]> {
    const data = await apiClient.get<any[]>('/experiments');
    return data.map(mapExperiment);
  },
  async createExperiment(data: Partial<ExperimentEntity>): Promise<ExperimentEntity> {
    const payload = {
      code: data.code,
      title: data.title,
      description: data.description,
      status: data.status,
      config: data.config,
      execution_metadata: data.executionMetadata,
      metadata: data.metadata,
    };
    const res = await apiClient.post('/experiments', payload);
    return mapExperiment(res);
  },
  async updateExperiment(id: string, data: Partial<ExperimentEntity>): Promise<ExperimentEntity> {
    const payload = {
      title: data.title,
      description: data.description,
      status: data.status,
      config: data.config,
      execution_metadata: data.executionMetadata,
      metadata: data.metadata,
    };
    const res = await apiClient.put(`/experiments/${id}`, payload);
    return mapExperiment(res);
  },
  async deleteExperiment(id: string): Promise<void> {
    return apiClient.delete(`/experiments/${id}`);
  },

  // Results
  async listResults(): Promise<ResultEntity[]> {
    const data = await apiClient.get<any[]>('/results');
    return data.map(mapResult);
  },
  async createResult(data: Partial<ResultEntity>): Promise<ResultEntity> {
    const payload = {
      code: data.code,
      title: data.title,
      experiment_id: data.experimentId,
      summary: data.summary,
      metrics: data.metrics,
      artifacts: data.artifacts,
      status: data.status,
      metadata: data.metadata,
    };
    const res = await apiClient.post('/results', payload);
    return mapResult(res);
  },
  async updateResult(id: string, data: Partial<ResultEntity>): Promise<ResultEntity> {
    const payload = {
      title: data.title,
      summary: data.summary,
      metrics: data.metrics,
      artifacts: data.artifacts,
      status: data.status,
      metadata: data.metadata,
    };
    const res = await apiClient.put(`/results/${id}`, payload);
    return mapResult(res);
  },
  async deleteResult(id: string): Promise<void> {
    return apiClient.delete(`/results/${id}`);
  },

  // Decisions
  async listDecisions(): Promise<DecisionEntity[]> {
    const data = await apiClient.get<any[]>('/decisions');
    return data.map(mapDecision);
  },
  async createDecision(data: Partial<DecisionEntity>): Promise<DecisionEntity> {
    const payload = {
      code: data.code,
      title: data.title,
      outcome: data.outcome,
      rationale: data.rationale,
      implications: data.implications,
      metadata: data.metadata,
    };
    const res = await apiClient.post('/decisions', payload);
    return mapDecision(res);
  },
  async updateDecision(id: string, data: Partial<DecisionEntity>): Promise<DecisionEntity> {
    const payload = {
      title: data.title,
      outcome: data.outcome,
      rationale: data.rationale,
      implications: data.implications,
      metadata: data.metadata,
    };
    const res = await apiClient.put(`/decisions/${id}`, payload);
    return mapDecision(res);
  },
  async deleteDecision(id: string): Promise<void> {
    return apiClient.delete(`/decisions/${id}`);
  },
  // Claims
  async listClaims(): Promise<ClaimEntity[]> {
    const data = await apiClient.get<any[]>('/claims');
    return data.map(mapClaim);
  },
  async createClaim(data: Partial<ClaimEntity>): Promise<ClaimEntity> {
    const payload = {
      code: data.code,
      title: data.title || data.statement,
      statement: data.statement || data.title,
      confidence_score: data.confidenceScore,
      status: data.status,
      metadata: data.metadata,
    };
    const res = await apiClient.post('/claims', payload);
    return mapClaim(res);
  },
  async updateClaim(id: string, data: Partial<ClaimEntity>): Promise<ClaimEntity> {
    const payload = {
      statement: data.statement || data.title,
      confidence_score: data.confidenceScore,
      status: data.status,
      metadata: data.metadata,
    };
    const res = await apiClient.put(`/claims/${id}`, payload);
    return mapClaim(res);
  },
  async deleteClaim(id: string): Promise<void> {
    return apiClient.delete(`/claims/${id}`);
  },

  // Evidence
  async listEvidence(): Promise<EvidenceEntity[]> {
    const data = await apiClient.get<any[]>('/evidence');
    return data.map(mapEvidence);
  },
  async createEvidence(data: Partial<EvidenceEntity>): Promise<EvidenceEntity> {
    const payload = {
      title: data.title,
      summary: data.summary,
      evidence_type: data.evidenceType,
      strength: data.strength,
      source_type: data.sourceType,
      source_id: data.sourceId,
      citation_doi: data.citationDoi,
      confidence_score: data.confidenceScore,
      metadata_json: data.metadata,
    };
    const res = await apiClient.post('/evidence', payload);
    return mapEvidence(res);
  },
  async updateEvidence(id: string, data: Partial<EvidenceEntity>): Promise<EvidenceEntity> {
    const payload = {
      title: data.title,
      summary: data.summary,
      evidence_type: data.evidenceType,
      strength: data.strength,
      source_type: data.sourceType,
      source_id: data.sourceId,
      citation_doi: data.citationDoi,
      confidence_score: data.confidenceScore,
      metadata_json: data.metadata,
    };
    const res = await apiClient.put(`/evidence/${id}`, payload);
    return mapEvidence(res);
  },
  async deleteEvidence(id: string): Promise<void> {
    return apiClient.delete(`/evidence/${id}`);
  },

  // Domains
  async listDomains(workspaceId: string): Promise<ResearchDomain[]> {
    const data = await apiClient.get<any[]>(`/workspaces/${workspaceId}/domains`);
    return data.map(mapDomain);
  },
  async createDomain(workspaceId: string, data: { name: string; description?: string; color_badge?: string; icon?: string }): Promise<ResearchDomain> {
    const res = await apiClient.post(`/workspaces/${workspaceId}/domains`, data);
    return mapDomain(res);
  },
  async deleteDomain(domainId: string): Promise<void> {
    return apiClient.delete(`/domains/${domainId}`);
  },

  // Datasets
  async listDatasets(): Promise<DatasetEntity[]> {
    const data = await apiClient.get<any[]>('/datasets');
    return data.map(mapDataset);
  },
  async createDataset(data: Partial<DatasetEntity>): Promise<DatasetEntity> {
    const payload = {
      name: data.title || (data as any).name,
      version: data.version || '1.0.0',
      modality: data.modality || 'image',
      description: data.description,
      source_url: data.sourceUrl,
      license: data.license,
      sample_count: data.sampleCount,
      size_bytes: data.sizeBytes,
      preprocessing_spec: data.preprocessingSpec,
      split_spec: data.splitSpec,
      metadata_json: data.metadata,
    };
    const res = await apiClient.post('/datasets', payload);
    return mapDataset(res);
  },
  async deleteDataset(id: string): Promise<void> {
    return apiClient.delete(`/datasets/${id}`);
  },

  // Models
  async listModels(): Promise<ModelEntity[]> {
    const data = await apiClient.get<any[]>('/models');
    return data.map(mapModel);
  },
  async createModel(data: Partial<ModelEntity>): Promise<ModelEntity> {
    const payload = {
      name: data.title || (data as any).name,
      version: data.version || '1.0.0',
      architecture: data.architecture,
      framework: data.framework || 'pytorch',
      parameter_count: data.parameterCount,
      checkpoint_url: data.checkpointUrl,
      code_commit_hash: data.codeCommitHash,
      description: data.description,
      hyperparameters: data.hyperparameters,
      metadata_json: data.metadata,
    };
    const res = await apiClient.post('/models', payload);
    return mapModel(res);
  },
  async deleteModel(id: string): Promise<void> {
    return apiClient.delete(`/models/${id}`);
  },

  // Relationships
  async listRelationships(): Promise<RelationshipLink[]> {
    const raw = await apiClient.get<any[]>('/relationships');
    return raw.map((r) => ({
      id: r.id,
      sourceId: r.source_id,
      sourceType: r.source_type,
      targetId: r.target_id,
      targetType: r.target_type,
      relationType: r.relation_type,
      confidence: r.confidence,
      notes: r.notes,
      createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    }));
  },
  async createRelationship(data: {
    sourceId: string;
    sourceType?: string;
    targetId: string;
    targetType?: string;
    relationType: string;
    notes?: string;
    confidence?: number;
  }): Promise<RelationshipLink> {
    const res = await apiClient.post('/relationships', {
      source_id: data.sourceId,
      source_type: data.sourceType,
      target_id: data.targetId,
      target_type: data.targetType,
      relation_type: data.relationType,
      notes: data.notes,
      confidence: data.confidence,
    });
    return {
      id: res.id,
      sourceId: res.source_id,
      sourceType: res.source_type,
      targetId: res.target_id,
      targetType: res.target_type,
      relationType: res.relation_type,
      confidence: res.confidence,
      notes: res.notes,
      createdAt: res.created_at || res.createdAt || new Date().toISOString(),
    };
  },
  async deleteRelationship(id: string): Promise<void> {
    return apiClient.delete(`/relationships/${id}`);
  },

  // Global Search & Research Timeline
  async globalSearch(query: string, typeFilter?: string): Promise<any> {
    const params = new URLSearchParams({ q: query });
    if (typeFilter && typeFilter !== 'all') {
      params.append('type', typeFilter);
    }
    return apiClient.get(`/search?${params.toString()}`);
  },
  async getTimeline(): Promise<any> {
    return apiClient.get('/timeline');
  },
};

