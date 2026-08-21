import { create } from 'zustand';
import { Project } from '../../../types/research';
import { projectApi, CreateProjectPayload, UpdateProjectPayload } from '../api/projectApi';

export interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchProjects: (workspaceId: string) => Promise<Project[]>;
  setActiveProject: (project: Project | null) => void;
  selectProjectById: (projectId: string) => Promise<Project | null>;
  createProject: (workspaceId: string, payload: CreateProjectPayload) => Promise<Project>;
  updateProject: (projectId: string, payload: UpdateProjectPayload) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  isLoading: false,
  isSaving: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchProjects: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectApi.listByWorkspace(workspaceId);
      const { activeProject } = get();
      
      let active = activeProject && activeProject.workspaceId === workspaceId
        ? projects.find((p) => p.id === activeProject.id) || null
        : null;

      if (!active && projects.length > 0) {
        active = projects[0];
      }

      set({
        projects,
        activeProject: active,
        isLoading: false,
      });
      return projects;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Failed to load research projects.',
      });
      return [];
    }
  },

  setActiveProject: (project: Project | null) => {
    set({ activeProject: project });
  },

  selectProjectById: async (projectId: string) => {
    const { projects } = get();
    let proj = projects.find((p) => p.id === projectId);
    if (!proj) {
      try {
        proj = await projectApi.getById(projectId);
      } catch {
        return null;
      }
    }
    if (proj) {
      set({ activeProject: proj });
    }
    return proj || null;
  },

  createProject: async (workspaceId: string, payload: CreateProjectPayload) => {
    set({ isSaving: true, error: null });
    try {
      const created = await projectApi.create(workspaceId, payload);
      set((state) => ({
        projects: [created, ...state.projects],
        activeProject: created,
        isSaving: false,
      }));
      return created;
    } catch (err: any) {
      set({
        isSaving: false,
        error: err.message || 'Failed to create research project.',
      });
      throw err;
    }
  },

  updateProject: async (projectId: string, payload: UpdateProjectPayload) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await projectApi.update(projectId, payload);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? updated : p)),
        activeProject: state.activeProject?.id === projectId ? updated : state.activeProject,
        isSaving: false,
      }));
      return updated;
    } catch (err: any) {
      set({
        isSaving: false,
        error: err.message || 'Failed to update research project.',
      });
      throw err;
    }
  },

  deleteProject: async (projectId: string) => {
    set({ isSaving: true, error: null });
    try {
      await projectApi.delete(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        activeProject: state.activeProject?.id === projectId ? null : state.activeProject,
        isSaving: false,
      }));
    } catch (err: any) {
      set({
        isSaving: false,
        error: err.message || 'Failed to delete research project.',
      });
      throw err;
    }
  },
}));
