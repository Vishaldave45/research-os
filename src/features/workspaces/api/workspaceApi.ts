import { apiClient } from '../../../services/api/client';
import { Workspace } from '../../../types/research';

export interface WorkspaceMember {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'researcher' | 'viewer';
  createdAt: string;
}

export const workspaceApi = {
  async listWorkspaces(): Promise<Workspace[]> {
    const res = await apiClient.get<any[]>('/workspaces');
    return (res || []).map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description || '',
      slug: w.slug,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));
  },

  async getWorkspace(id: string): Promise<Workspace> {
    const w = await apiClient.get<any>(`/workspaces/${id}`);
    return {
      id: w.id,
      name: w.name,
      description: w.description || '',
      slug: w.slug,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    };
  },

  async createWorkspace(data: { name: string; description?: string; slug?: string }): Promise<Workspace> {
    const w = await apiClient.post<any>('/workspaces', data);
    return {
      id: w.id,
      name: w.name,
      description: w.description || '',
      slug: w.slug,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    };
  },

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const res = await apiClient.get<any[]>(`/workspaces/${workspaceId}/members`);
    return (res || []).map((m) => ({
      id: m.id,
      userId: m.user_id,
      email: m.email,
      fullName: m.full_name,
      role: m.role,
      createdAt: m.created_at,
    }));
  },

  async addMember(
    workspaceId: string,
    data: { email: string; role: 'admin' | 'researcher' | 'viewer' }
  ): Promise<WorkspaceMember> {
    const m = await apiClient.post<any>(`/workspaces/${workspaceId}/members`, data);
    return {
      id: m.id,
      userId: m.user_id,
      email: m.email,
      fullName: m.full_name,
      role: m.role,
      createdAt: m.created_at,
    };
  },

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },
};
