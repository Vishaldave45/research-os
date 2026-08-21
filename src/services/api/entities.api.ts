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
  RelationshipLink,
} from '../../types/research';

export const entitiesApi = {
  // Questions
  async listQuestions(): Promise<ResearchQuestionEntity[]> {
    return apiClient.get('/questions');
  },
  async createQuestion(data: Partial<ResearchQuestionEntity>): Promise<ResearchQuestionEntity> {
    return apiClient.post('/questions', data);
  },
  async updateQuestion(id: string, data: Partial<ResearchQuestionEntity>): Promise<ResearchQuestionEntity> {
    return apiClient.put(`/questions/${id}`, data);
  },
  async deleteQuestion(id: string): Promise<void> {
    return apiClient.delete(`/questions/${id}`);
  },

  // Papers
  async listPapers(): Promise<PaperEntity[]> {
    return apiClient.get('/papers');
  },
  async createPaper(data: Partial<PaperEntity>): Promise<PaperEntity> {
    return apiClient.post('/papers', data);
  },
  async updatePaper(id: string, data: Partial<PaperEntity>): Promise<PaperEntity> {
    return apiClient.put(`/papers/${id}`, data);
  },
  async deletePaper(id: string): Promise<void> {
    return apiClient.delete(`/papers/${id}`);
  },

  // Gaps
  async listGaps(): Promise<GapEntity[]> {
    return apiClient.get('/gaps');
  },
  async createGap(data: Partial<GapEntity>): Promise<GapEntity> {
    return apiClient.post('/gaps', data);
  },
  async updateGap(id: string, data: Partial<GapEntity>): Promise<GapEntity> {
    return apiClient.put(`/gaps/${id}`, data);
  },
  async deleteGap(id: string): Promise<void> {
    return apiClient.delete(`/gaps/${id}`);
  },

  // Hypotheses
  async listHypotheses(): Promise<HypothesisEntity[]> {
    return apiClient.get('/hypotheses');
  },
  async createHypothesis(data: Partial<HypothesisEntity>): Promise<HypothesisEntity> {
    return apiClient.post('/hypotheses', data);
  },
  async updateHypothesis(id: string, data: Partial<HypothesisEntity>): Promise<HypothesisEntity> {
    return apiClient.put(`/hypotheses/${id}`, data);
  },
  async deleteHypothesis(id: string): Promise<void> {
    return apiClient.delete(`/hypotheses/${id}`);
  },

  // Experiments
  async listExperiments(): Promise<ExperimentEntity[]> {
    return apiClient.get('/experiments');
  },
  async createExperiment(data: Partial<ExperimentEntity>): Promise<ExperimentEntity> {
    return apiClient.post('/experiments', data);
  },
  async updateExperiment(id: string, data: Partial<ExperimentEntity>): Promise<ExperimentEntity> {
    return apiClient.put(`/experiments/${id}`, data);
  },
  async deleteExperiment(id: string): Promise<void> {
    return apiClient.delete(`/experiments/${id}`);
  },

  // Results
  async listResults(): Promise<ResultEntity[]> {
    return apiClient.get('/results');
  },
  async createResult(data: Partial<ResultEntity>): Promise<ResultEntity> {
    return apiClient.post('/results', data);
  },
  async updateResult(id: string, data: Partial<ResultEntity>): Promise<ResultEntity> {
    return apiClient.put(`/results/${id}`, data);
  },
  async deleteResult(id: string): Promise<void> {
    return apiClient.delete(`/results/${id}`);
  },

  // Decisions
  async listDecisions(): Promise<DecisionEntity[]> {
    return apiClient.get('/decisions');
  },
  async createDecision(data: Partial<DecisionEntity>): Promise<DecisionEntity> {
    return apiClient.post('/decisions', data);
  },
  async updateDecision(id: string, data: Partial<DecisionEntity>): Promise<DecisionEntity> {
    return apiClient.put(`/decisions/${id}`, data);
  },
  async deleteDecision(id: string): Promise<void> {
    return apiClient.delete(`/decisions/${id}`);
  },

  // Claims
  async listClaims(): Promise<ClaimEntity[]> {
    return apiClient.get('/claims');
  },
  async createClaim(data: Partial<ClaimEntity>): Promise<ClaimEntity> {
    return apiClient.post('/claims', data);
  },
  async updateClaim(id: string, data: Partial<ClaimEntity>): Promise<ClaimEntity> {
    return apiClient.put(`/claims/${id}`, data);
  },
  async deleteClaim(id: string): Promise<void> {
    return apiClient.delete(`/claims/${id}`);
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
      createdAt: r.created_at,
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
      createdAt: res.created_at,
    };
  },
  async deleteRelationship(id: string): Promise<void> {
    return apiClient.delete(`/relationships/${id}`);
  },
};
