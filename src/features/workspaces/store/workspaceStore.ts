import { create } from 'zustand';
import { Workspace } from '../../../types/research';
import { workspaceApi, WorkspaceMember } from '../api/workspaceApi';
import { apiClient } from '../../../services/api/client';

export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  members: WorkspaceMember[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchWorkspaces: () => Promise<Workspace[]>;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  selectWorkspaceById: (workspaceId: string) => Promise<Workspace | null>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  fetchMembers: (workspaceId?: string) => Promise<WorkspaceMember[]>;
  addMember: (email: string, role: 'admin' | 'researcher' | 'viewer') => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  members: [],
  isLoading: false,
  isSaving: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const workspaces = await workspaceApi.listWorkspaces();
      const currentActiveId = apiClient.getActiveWorkspaceId();
      let active = workspaces.find((w) => w.id === currentActiveId) || null;

      if (!active && workspaces.length > 0) {
        active = workspaces[0];
        apiClient.setActiveWorkspace(active.id);
      }

      set({
        workspaces,
        activeWorkspace: active,
        isLoading: false,
        error: null,
      });
      return workspaces;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.status === 401 ? null : err.message || 'Failed to load workspaces.',
      });
      return [];
    }
  },

  setActiveWorkspace: (workspace: Workspace | null) => {
    if (workspace) {
      apiClient.setActiveWorkspace(workspace.id);
    }
    set({ activeWorkspace: workspace });
  },

  selectWorkspaceById: async (workspaceId: string) => {
    const { workspaces } = get();
    let ws = workspaces.find((w) => w.id === workspaceId);
    if (!ws) {
      try {
        ws = await workspaceApi.getWorkspace(workspaceId);
      } catch {
        return null;
      }
    }
    if (ws) {
      apiClient.setActiveWorkspace(ws.id);
      set({ activeWorkspace: ws });
    }
    return ws || null;
  },

  createWorkspace: async (name: string, description?: string) => {
    set({ isSaving: true, error: null });
    try {
      const created = await workspaceApi.createWorkspace({ name, description });
      apiClient.setActiveWorkspace(created.id);
      set((state) => ({
        workspaces: [created, ...state.workspaces],
        activeWorkspace: created,
        isSaving: false,
      }));
      return created;
    } catch (err: any) {
      set({
        isSaving: false,
        error: err.message || 'Failed to create workspace.',
      });
      throw err;
    }
  },

  fetchMembers: async (workspaceId?: string) => {
    const wsId = workspaceId || get().activeWorkspace?.id;
    if (!wsId) return [];
    try {
      const members = await workspaceApi.listMembers(wsId);
      set({ members });
      return members;
    } catch (err: any) {
      console.warn('Failed to load workspace members:', err);
      return [];
    }
  },

  addMember: async (email: string, role: 'admin' | 'researcher' | 'viewer') => {
    const wsId = get().activeWorkspace?.id;
    if (!wsId) throw new Error('No active workspace selected.');
    set({ isSaving: true, error: null });
    try {
      const newMember = await workspaceApi.addMember(wsId, { email, role });
      set((state) => ({
        members: [...state.members, newMember],
        isSaving: false,
      }));
    } catch (err: any) {
      set({
        isSaving: false,
        error: err.message || 'Failed to invite member.',
      });
      throw err;
    }
  },

  removeMember: async (userId: string) => {
    const wsId = get().activeWorkspace?.id;
    if (!wsId) return;
    try {
      await workspaceApi.removeMember(wsId, userId);
      set((state) => ({
        members: state.members.filter((m) => m.userId !== userId),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove member.' });
      throw err;
    }
  },
}));
