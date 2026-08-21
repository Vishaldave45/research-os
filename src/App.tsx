/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore } from './features/auth/store/authStore';
import { useWorkspaceStore } from './features/workspaces/store/workspaceStore';
import { useProjectStore } from './features/projects/store/projectStore';
import { useResearchStore } from './store/useResearchStore';

import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';

import { TopBar } from './layouts/TopBar';
import { WorkspaceSidebar } from './layouts/WorkspaceSidebar';
import { ProjectSidebar } from './layouts/ProjectSidebar';

import { WorkspaceSelectionPage } from './features/workspaces/pages/WorkspaceSelectionPage';
import { WorkspaceOverviewPage } from './features/workspaces/pages/WorkspaceOverviewPage';
import { WorkspaceMembersPage } from './features/workspaces/pages/WorkspaceMembersPage';
import { WorkspaceSettingsPage } from './features/workspaces/pages/WorkspaceSettingsPage';

import { ProjectsListPage } from './features/projects/pages/ProjectsListPage';
import { ProjectOverviewPage } from './features/projects/pages/ProjectOverviewPage';
import { ProjectQuestionsPage } from './features/projects/pages/ProjectQuestionsPage';
import { ProjectPapersPage } from './features/projects/pages/ProjectPapersPage';
import { ProjectGapsPage } from './features/projects/pages/ProjectGapsPage';
import { ProjectHypothesesPage } from './features/projects/pages/ProjectHypothesesPage';
import { ProjectExperimentsPage } from './features/projects/pages/ProjectExperimentsPage';
import { ProjectResultsPage } from './features/projects/pages/ProjectResultsPage';
import { ProjectDecisionsPage } from './features/projects/pages/ProjectDecisionsPage';
import { ProjectClaimsPage } from './features/projects/pages/ProjectClaimsPage';
import { ProjectTraceabilityPage } from './features/projects/pages/ProjectTraceabilityPage';

import { CreateNodeModal } from './components/modals/CreateNodeModal';
import { TraceEvidenceModal } from './components/modals/TraceEvidenceModal';
import { CreateProjectModal } from './features/projects/components/CreateProjectModal';
import { CreateWorkspaceModal } from './features/workspaces/components/CreateWorkspaceModal';

import { WorkspaceViewMode, ProjectViewMode } from './types/research';

export default function App() {
  const { initAuth, isAuthenticated } = useAuthStore();
  const { workspaces, activeWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const { activeProject, setActiveProject, fetchProjects } = useProjectStore();
  const {
    syncFromBackend,
    isTraceModalOpen,
    traceDecisionId,
    openTraceModal,
    closeTraceModal,
    resetToCanonicalDataset,
    error,
    setError,
    isSyncing,
  } = useResearchStore();

  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [workspaceView, setWorkspaceView] = useState<WorkspaceViewMode>('overview');
  const [projectView, setProjectView] = useState<ProjectViewMode>('overview');
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces().then((wsList) => {
        if (wsList.length > 0) {
          const firstWs = wsList[0];
          fetchProjects(firstWs.id);
          syncFromBackend();
        }
      });
    }
  }, [isAuthenticated, fetchWorkspaces, fetchProjects, syncFromBackend]);

  const authFallback =
    authView === 'login' ? (
      <LoginPage
        onNavigateToRegister={() => setAuthView('register')}
        onNavigateToForgotPassword={() => setAuthView('forgot-password')}
      />
    ) : authView === 'register' ? (
      <RegisterPage
        onNavigateToLogin={() => setAuthView('login')}
      />
    ) : (
      <ForgotPasswordPage
        onNavigateToLogin={() => setAuthView('login')}
      />
    );

  // If authenticated but no workspace exists yet
  if (isAuthenticated && workspaces.length === 0) {
    return (
      <WorkspaceSelectionPage
        onWorkspaceSelected={(ws) => {
          fetchProjects(ws.id);
          syncFromBackend();
        }}
      />
    );
  }

  return (
    <ProtectedRoute fallback={authFallback}>
      <div
        id="researchos-root"
        className="flex h-screen w-screen flex-col bg-slate-900 font-sans text-slate-900 antialiased overflow-hidden"
      >
        {/* Top Bar Header with Breadcrumbs & User Menu */}
        <TopBar
          onNavigateToWorkspaceSettings={() => {
            setActiveProject(null);
            setWorkspaceView('settings');
          }}
        />

        {/* Global Sync Error Banner */}
        {error && (
          <div className="bg-amber-500/95 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs shrink-0 z-40">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => syncFromBackend()}
                disabled={isSyncing}
                className="bg-slate-900 text-white px-2.5 py-1 rounded text-xs hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                {isSyncing ? 'Syncing...' : 'Retry Sync'}
              </button>
              <button
                onClick={() => setError(null)}
                className="text-slate-900 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area with Dynamic Sidebar */}
        <div className="flex flex-1 overflow-hidden bg-slate-50">
          {/* Dynamic Sidebar: Scoped by Active Project or Workspace */}
          {activeProject ? (
            <ProjectSidebar
              project={activeProject}
              currentView={projectView}
              onSelectView={(view) => setProjectView(view)}
              onBackToProjects={() => {
                setActiveProject(null);
                setWorkspaceView('projects');
              }}
            />
          ) : (
            <WorkspaceSidebar
              currentView={workspaceView}
              onSelectView={(view) => setWorkspaceView(view)}
            />
          )}

          {/* Main Viewport Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50/50">
            {activeProject ? (
              // Project-Scoped Views
              <>
                {projectView === 'overview' && (
                  <ProjectOverviewPage
                    onNavigateSection={(section) => setProjectView(section as ProjectViewMode)}
                  />
                )}
                {projectView === 'questions' && <ProjectQuestionsPage />}
                {projectView === 'papers' && <ProjectPapersPage />}
                {projectView === 'gaps' && <ProjectGapsPage />}
                {projectView === 'hypotheses' && <ProjectHypothesesPage />}
                {projectView === 'experiments' && <ProjectExperimentsPage />}
                {projectView === 'results' && <ProjectResultsPage />}
                {projectView === 'decisions' && (
                  <ProjectDecisionsPage onTraceDecision={(id) => openTraceModal(id)} />
                )}
                {projectView === 'claims' && <ProjectClaimsPage />}
                {projectView === 'traceability' && <ProjectTraceabilityPage />}
              </>
            ) : (
              // Workspace-Scoped Views
              <>
                {workspaceView === 'overview' && (
                  <WorkspaceOverviewPage
                    onNavigateToProjects={() => setWorkspaceView('projects')}
                    onSelectProject={(project) => {
                      setActiveProject(project);
                      setProjectView('overview');
                    }}
                    onCreateProject={() => setIsCreateProjectModalOpen(true)}
                  />
                )}
                {workspaceView === 'projects' && (
                  <ProjectsListPage
                    onSelectProject={(project) => {
                      setActiveProject(project);
                      setProjectView('overview');
                    }}
                    onSeedCanonicalDataset={() => {
                      resetToCanonicalDataset();
                      if (activeWorkspace) fetchProjects(activeWorkspace.id);
                    }}
                  />
                )}
                {workspaceView === 'members' && <WorkspaceMembersPage />}
                {workspaceView === 'settings' && <WorkspaceSettingsPage />}
              </>
            )}
          </main>
        </div>

        {/* Global Modals */}
        <CreateNodeModal />
        <TraceEvidenceModal
          isOpen={isTraceModalOpen}
          onClose={closeTraceModal}
          decisionId={traceDecisionId}
        />
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          onSuccess={(proj) => {
            setActiveProject(proj);
            setProjectView('overview');
          }}
        />
        <CreateWorkspaceModal
          isOpen={isCreateWorkspaceModalOpen}
          onClose={() => setIsCreateWorkspaceModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
