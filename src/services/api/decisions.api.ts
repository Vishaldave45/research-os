import { apiClient } from './client';
import { DecisionEntity } from '../../types/research';

export interface TraceNode {
  id: string;
  code: string;
  type: string;
  title: string;
  status?: string;
  outcome?: string;
  metrics?: any;
  confidence?: number;
  confidenceScore?: number;
  level: number;
}

export interface TraceEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: string;
}

export interface BackwardTraceResponse {
  decision: DecisionEntity;
  rootPath: string[];
  nodes: TraceNode[];
  edges: TraceEdge[];
  summary: {
    totalEntitiesInChain: number;
    resultsCount: number;
    experimentsCount: number;
    hypothesesCount: number;
    gapsCount: number;
    questionsCount: number;
    papersCount: number;
    isFullyGrounded: boolean;
    verificationScore: number;
  };
}

export const decisionsApi = {
  async getBackwardTrace(decisionId: string): Promise<BackwardTraceResponse> {
    return apiClient.get(`/decisions/${decisionId}/trace`);
  },
};
