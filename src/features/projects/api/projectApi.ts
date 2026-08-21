import { apiClient } from '../../../services/api/client';
import { Project } from '../../../types/research';

export interface CreateProjectPayload {
  name: string;
  research_area?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}

export interface UpdateProjectPayload {
  name?: string;
  research_area?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}

function mapBackendProject(raw: any): Project {
  return {
    id: raw.id,
    workspaceId: raw.workspace_id,
    name: raw.name,
    slug: raw.slug,
    researchArea: raw.research_area || undefined,
    description: raw.description || undefined,
    status: raw.status || 'active',
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    summary: raw.summary
      ? {
          questionsCount: raw.summary.questions_count || 0,
          papersCount: raw.summary.papers_count || 0,
          gapsCount: raw.summary.gaps_count || 0,
          hypothesesCount: raw.summary.hypotheses_count || 0,
          experimentsCount: raw.summary.experiments_count || 0,
          resultsCount: raw.summary.results_count || 0,
          decisionsCount: raw.summary.decisions_count || 0,
          claimsCount: raw.summary.claims_count || 0,
        }
      : undefined,
  };
}

export const projectApi = {
  async listByWorkspace(workspaceId: string, status?: string): Promise<Project[]> {
    const query = status ? `?status=${status}` : '';
    const res = await apiClient.get<any[]>(`/workspaces/${workspaceId}/projects${query}`);
    return (res || []).map(mapBackendProject);
  },

  async getById(projectId: string): Promise<Project> {
    const res = await apiClient.get<any>(`/projects/${projectId}`);
    return mapBackendProject(res);
  },

  async create(workspaceId: string, payload: CreateProjectPayload): Promise<Project> {
    const res = await apiClient.post<any>(`/workspaces/${workspaceId}/projects`, payload);
    return mapBackendProject(res);
  },

  async update(projectId: string, payload: UpdateProjectPayload): Promise<Project> {
    const res = await apiClient.put<any>(`/projects/${projectId}`, payload);
    return mapBackendProject(res);
  },

  async delete(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`);
  },
};
