import { create } from 'zustand';
import {
  ResearchEntity,
  EntityType,
  RelationshipLink,
  Workspace,
  ViewMode,
  CanvasLayoutMode,
  LiteratureMatrixRow,
  DiscoveredGapProposal,
  ClaimValidationAudit,
  ResearchQuestionEntity,
  PaperEntity,
  GapEntity,
  HypothesisEntity,
  ExperimentEntity,
  ResultEntity,
  DecisionEntity,
  ClaimEntity,
} from '../types/research';
import { entitiesApi } from '../services/api/entities.api';
import { apiClient } from '../services/api/client';
import { isRelationSemanticallyAllowed, wouldCreateCycle } from '../utils/relationshipRules';

const DEFAULT_WORKSPACE: Workspace = {
  id: '',
  name: 'Research Workspace',
  description: 'Connected PostgreSQL Research Workspace',
  createdAt: new Date().toISOString(),
};

interface ResearchStoreState {
  workspace: Workspace;
  questions: ResearchQuestionEntity[];
  papers: PaperEntity[];
  gaps: GapEntity[];
  hypotheses: HypothesisEntity[];
  experiments: ExperimentEntity[];
  results: ResultEntity[];
  decisions: DecisionEntity[];
  claims: ClaimEntity[];
  relationships: RelationshipLink[];

  selectedEntityId: string | null;
  selectedEntityType: EntityType | null;
  isInspectorOpen: boolean;

  viewMode: ViewMode;
  layoutMode: CanvasLayoutMode;
  searchQuery: string;
  typeFilter: EntityType | 'all';
  highlightedLineage: {
    upstreamNodeIds: string[];
    downstreamNodeIds: string[];
    activeNodeId: string | null;
  };

  isCreateModalOpen: boolean;
  createModalInitialType: EntityType;
  isLinkModalOpen: boolean;
  linkModalSourceId: string | null;
  isCommandPaletteOpen: boolean;
  isAiModalOpen: boolean;

  // Trace Evidence Modal
  isTraceModalOpen: boolean;
  traceDecisionId: string | null;
  openTraceModal: (decisionId: string) => void;
  closeTraceModal: () => void;

  // Auth Modal
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // API sync state
  isSyncing: boolean;
  isSaving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  syncFromBackend: () => Promise<void>;

  // Actions
  selectEntity: (id: string | null, type?: EntityType) => void;
  closeInspector: () => void;
  setViewMode: (mode: ViewMode) => void;
  setLayoutMode: (mode: CanvasLayoutMode) => void;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (filter: EntityType | 'all') => void;
  setLineageHighlight: (nodeId: string | null) => void;
  clearLineageHighlight: () => void;

  openCreateModal: (type?: EntityType) => void;
  closeCreateModal: () => void;
  openLinkModal: (sourceId?: string) => void;
  closeLinkModal: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setAiModalOpen: (open: boolean) => void;

  // Entity CRUD (Async authoritative API transactions)
  addEntity: (entity: ResearchEntity) => Promise<ResearchEntity>;
  updateEntity: (entity: ResearchEntity) => Promise<ResearchEntity>;
  deleteEntity: (id: string, type: EntityType) => Promise<void>;

  // Relationship CRUD (Async authoritative API transactions)
  addRelationship: (rel: Omit<RelationshipLink, 'id' | 'createdAt'>) => Promise<RelationshipLink>;
  deleteRelationship: (id: string) => Promise<void>;

  // Reset / Seed
  resetToCanonicalDataset: () => Promise<void>;

  // Selectors / Helpers
  getAllEntities: () => ResearchEntity[];
  getEntityById: (id: string) => ResearchEntity | undefined;
  getUpstreamEntities: (id: string) => ResearchEntity[];
  getDownstreamEntities: (id: string) => ResearchEntity[];
  getConnectedRelationships: (id: string) => RelationshipLink[];
  getLiteratureMatrix: () => LiteratureMatrixRow[];
  getDiscoveredGaps: () => DiscoveredGapProposal[];
  validateClaimAudit: (claimId: string) => ClaimValidationAudit | null;
}

const UI_STORAGE_KEY = 'researchos_ui_prefs';

const getSavedUIPrefs = () => {
  try {
    const saved = localStorage.getItem(UI_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load UI preferences:', e);
  }
  return {
    viewMode: 'canvas' as ViewMode,
    layoutMode: 'pipeline' as CanvasLayoutMode,
  };
};

export const useResearchStore = create<ResearchStoreState>((set, get) => {
  const initialUIPrefs = getSavedUIPrefs();

  const persistUIPrefs = (prefs: { viewMode?: ViewMode; layoutMode?: CanvasLayoutMode }) => {
    try {
      const current = getSavedUIPrefs();
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({ ...current, ...prefs }));
    } catch (e) {
      console.error('Failed to persist UI preferences:', e);
    }
  };

  return {
    // State initialized empty; populated strictly via FastAPI / PostgreSQL
    workspace: DEFAULT_WORKSPACE,
    questions: [],
    papers: [],
    gaps: [],
    hypotheses: [],
    experiments: [],
    results: [],
    decisions: [],
    claims: [],
    relationships: [],

    selectedEntityId: null,
    selectedEntityType: null,
    isInspectorOpen: false,

    viewMode: initialUIPrefs.viewMode || 'canvas',
    layoutMode: initialUIPrefs.layoutMode || 'pipeline',
    searchQuery: '',
    typeFilter: 'all',
    highlightedLineage: {
      upstreamNodeIds: [],
      downstreamNodeIds: [],
      activeNodeId: null,
    },

    isCreateModalOpen: false,
    createModalInitialType: 'hypothesis',
    isLinkModalOpen: false,
    linkModalSourceId: null,
    isCommandPaletteOpen: false,
    isAiModalOpen: false,

    isTraceModalOpen: false,
    traceDecisionId: null,
    openTraceModal: (decisionId: string) =>
      set({ isTraceModalOpen: true, traceDecisionId: decisionId }),
    closeTraceModal: () =>
      set({ isTraceModalOpen: false, traceDecisionId: null }),

    isAuthModalOpen: false,
    setAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open }),

    isSyncing: false,
    isSaving: false,
    error: null,
    setError: (error) => set({ error }),

    syncFromBackend: async () => {
      const token = apiClient.getAccessToken();
      if (!token) {
        set({
          isAuthModalOpen: true,
          error: 'Please sign in or register to connect to your persistent research workspace.',
        });
        return;
      }
      set({ isSyncing: true, error: null });
      try {
        // Fetch user workspaces and activate primary workspace
        try {
          const workspaces = await apiClient.get<any[]>('/workspaces');
          if (Array.isArray(workspaces) && workspaces.length > 0) {
            const currentWsId = apiClient.getActiveWorkspaceId();
            const matchedWs = workspaces.find((w) => w.id === currentWsId) || workspaces[0];
            apiClient.setActiveWorkspace(matchedWs.id);
            set({
              workspace: {
                id: matchedWs.id,
                name: matchedWs.name,
                description: matchedWs.description || '',
                slug: matchedWs.slug,
                createdAt: matchedWs.created_at || new Date().toISOString(),
              },
            });
          }
        } catch {
          // Backend will auto-resolve workspace context
        }

        const [
          questions,
          papers,
          gaps,
          hypotheses,
          experiments,
          results,
          decisions,
          claims,
          relationships,
        ] = await Promise.all([
          entitiesApi.listQuestions(),
          entitiesApi.listPapers(),
          entitiesApi.listGaps(),
          entitiesApi.listHypotheses(),
          entitiesApi.listExperiments(),
          entitiesApi.listResults(),
          entitiesApi.listDecisions(),
          entitiesApi.listClaims(),
          entitiesApi.listRelationships(),
        ]);

        set({
          questions: questions || [],
          papers: papers || [],
          gaps: gaps || [],
          hypotheses: hypotheses || [],
          experiments: experiments || [],
          results: results || [],
          decisions: decisions || [],
          claims: claims || [],
          relationships: relationships || [],
          error: null,
        });
      } catch (err: any) {
        const msg = err.message || 'Unable to sync research entities from backend. Please verify your connection or retry.';
        console.warn('Backend sync error:', err);
        if (err.status === 401) {
          set({
            isAuthModalOpen: true,
            error: 'Authentication session expired or missing. Please sign in again.',
          });
        } else {
          set({ error: msg });
        }
      } finally {
        set({ isSyncing: false });
      }
    },

    selectEntity: (id, type) => {
      if (!id) {
        set({ selectedEntityId: null, selectedEntityType: null, isInspectorOpen: false });
        get().clearLineageHighlight();
        return;
      }
      const entity = get().getEntityById(id);
      const entityType = type || entity?.type || null;
      set({
        selectedEntityId: id,
        selectedEntityType: entityType,
        isInspectorOpen: true,
      });
      get().setLineageHighlight(id);
    },

    closeInspector: () => {
      set({ isInspectorOpen: false });
      get().clearLineageHighlight();
    },

    setViewMode: (mode) => {
      set({ viewMode: mode });
      persistUIPrefs({ viewMode: mode });
    },
    setLayoutMode: (mode) => {
      set({ layoutMode: mode });
      persistUIPrefs({ layoutMode: mode });
    },
    setSearchQuery: (query) => set({ searchQuery: query }),
    setTypeFilter: (filter) => set({ typeFilter: filter }),

    setLineageHighlight: (nodeId) => {
      if (!nodeId) {
        get().clearLineageHighlight();
        return;
      }
      const rels = get().relationships;
      const upstreamIds = new Set<string>();
      const downstreamIds = new Set<string>();

      // Traverse upstream
      const findUpstream = (targetId: string) => {
        rels.forEach((r) => {
          if (r.targetId === targetId && !upstreamIds.has(r.sourceId)) {
            upstreamIds.add(r.sourceId);
            findUpstream(r.sourceId);
          }
        });
      };

      // Traverse downstream
      const findDownstream = (sourceId: string) => {
        rels.forEach((r) => {
          if (r.sourceId === sourceId && !downstreamIds.has(r.targetId)) {
            downstreamIds.add(r.targetId);
            findDownstream(r.targetId);
          }
        });
      };

      findUpstream(nodeId);
      findDownstream(nodeId);

      set({
        highlightedLineage: {
          upstreamNodeIds: Array.from(upstreamIds),
          downstreamNodeIds: Array.from(downstreamIds),
          activeNodeId: nodeId,
        },
      });
    },

    clearLineageHighlight: () => {
      set({
        highlightedLineage: {
          upstreamNodeIds: [],
          downstreamNodeIds: [],
          activeNodeId: null,
        },
      });
    },

    openCreateModal: (type = 'hypothesis') => {
      set({ isCreateModalOpen: true, createModalInitialType: type });
    },
    closeCreateModal: () => set({ isCreateModalOpen: false }),

    openLinkModal: (sourceId) => {
      set({ isLinkModalOpen: true, linkModalSourceId: sourceId || null });
    },
    closeLinkModal: () => set({ isLinkModalOpen: false, linkModalSourceId: null }),

    setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
    setAiModalOpen: (open) => set({ isAiModalOpen: open }),

    // Authoritative Async Entity Creation
    addEntity: async (entity) => {
      set({ isSaving: true, error: null });
      try {
        let createdOnServer = entity;
        switch (entity.type) {
          case 'question':
            createdOnServer = await entitiesApi.createQuestion(entity);
            set((state) => ({ questions: [createdOnServer as ResearchQuestionEntity, ...state.questions] }));
            break;
          case 'paper':
            createdOnServer = await entitiesApi.createPaper(entity);
            set((state) => ({ papers: [createdOnServer as PaperEntity, ...state.papers] }));
            break;
          case 'gap':
            createdOnServer = await entitiesApi.createGap(entity);
            set((state) => ({ gaps: [createdOnServer as GapEntity, ...state.gaps] }));
            break;
          case 'hypothesis':
            createdOnServer = await entitiesApi.createHypothesis(entity);
            set((state) => ({ hypotheses: [createdOnServer as HypothesisEntity, ...state.hypotheses] }));
            break;
          case 'experiment':
            createdOnServer = await entitiesApi.createExperiment(entity);
            set((state) => ({ experiments: [createdOnServer as ExperimentEntity, ...state.experiments] }));
            break;
          case 'result':
            createdOnServer = await entitiesApi.createResult(entity);
            set((state) => ({ results: [createdOnServer as ResultEntity, ...state.results] }));
            break;
          case 'decision':
            createdOnServer = await entitiesApi.createDecision(entity);
            set((state) => ({ decisions: [createdOnServer as DecisionEntity, ...state.decisions] }));
            break;
          case 'claim':
            createdOnServer = await entitiesApi.createClaim(entity);
            set((state) => ({ claims: [createdOnServer as ClaimEntity, ...state.claims] }));
            break;
        }

        set({
          selectedEntityId: createdOnServer.id,
          selectedEntityType: createdOnServer.type,
          isInspectorOpen: true,
        });

        return createdOnServer;
      } catch (err: any) {
        const msg = err.message || 'Failed to create entity on server.';
        set({ error: msg });
        throw err;
      } finally {
        set({ isSaving: false });
      }
    },

    // Authoritative Async Entity Update
    updateEntity: async (entity) => {
      set({ isSaving: true, error: null });
      try {
        let updatedOnServer = entity;
        switch (entity.type) {
          case 'question':
            updatedOnServer = await entitiesApi.updateQuestion(entity.id, entity);
            set((state) => ({
              questions: state.questions.map((q) => (q.id === entity.id ? (updatedOnServer as ResearchQuestionEntity) : q)),
            }));
            break;
          case 'paper':
            updatedOnServer = await entitiesApi.updatePaper(entity.id, entity);
            set((state) => ({
              papers: state.papers.map((p) => (p.id === entity.id ? (updatedOnServer as PaperEntity) : p)),
            }));
            break;
          case 'gap':
            updatedOnServer = await entitiesApi.updateGap(entity.id, entity);
            set((state) => ({
              gaps: state.gaps.map((g) => (g.id === entity.id ? (updatedOnServer as GapEntity) : g)),
            }));
            break;
          case 'hypothesis':
            updatedOnServer = await entitiesApi.updateHypothesis(entity.id, entity);
            set((state) => ({
              hypotheses: state.hypotheses.map((h) => (h.id === entity.id ? (updatedOnServer as HypothesisEntity) : h)),
            }));
            break;
          case 'experiment':
            updatedOnServer = await entitiesApi.updateExperiment(entity.id, entity);
            set((state) => ({
              experiments: state.experiments.map((e) => (e.id === entity.id ? (updatedOnServer as ExperimentEntity) : e)),
            }));
            break;
          case 'result':
            updatedOnServer = await entitiesApi.updateResult(entity.id, entity);
            set((state) => ({
              results: state.results.map((r) => (r.id === entity.id ? (updatedOnServer as ResultEntity) : r)),
            }));
            break;
          case 'decision':
            updatedOnServer = await entitiesApi.updateDecision(entity.id, entity);
            set((state) => ({
              decisions: state.decisions.map((d) => (d.id === entity.id ? (updatedOnServer as DecisionEntity) : d)),
            }));
            break;
          case 'claim':
            updatedOnServer = await entitiesApi.updateClaim(entity.id, entity);
            set((state) => ({
              claims: state.claims.map((c) => (c.id === entity.id ? (updatedOnServer as ClaimEntity) : c)),
            }));
            break;
        }
        return updatedOnServer;
      } catch (err: any) {
        const msg = err.message || 'Failed to update entity on server.';
        set({ error: msg });
        throw err;
      } finally {
        set({ isSaving: false });
      }
    },

    // Authoritative Async Entity Delete
    deleteEntity: async (id, type) => {
      set({ isSaving: true, error: null });
      try {
        switch (type) {
          case 'question':
            await entitiesApi.deleteQuestion(id);
            set((state) => ({ questions: state.questions.filter((q) => q.id !== id) }));
            break;
          case 'paper':
            await entitiesApi.deletePaper(id);
            set((state) => ({ papers: state.papers.filter((p) => p.id !== id) }));
            break;
          case 'gap':
            await entitiesApi.deleteGap(id);
            set((state) => ({ gaps: state.gaps.filter((g) => g.id !== id) }));
            break;
          case 'hypothesis':
            await entitiesApi.deleteHypothesis(id);
            set((state) => ({ hypotheses: state.hypotheses.filter((h) => h.id !== id) }));
            break;
          case 'experiment':
            await entitiesApi.deleteExperiment(id);
            set((state) => ({ experiments: state.experiments.filter((e) => e.id !== id) }));
            break;
          case 'result':
            await entitiesApi.deleteResult(id);
            set((state) => ({ results: state.results.filter((r) => r.id !== id) }));
            break;
          case 'decision':
            await entitiesApi.deleteDecision(id);
            set((state) => ({ decisions: state.decisions.filter((d) => d.id !== id) }));
            break;
          case 'claim':
            await entitiesApi.deleteClaim(id);
            set((state) => ({ claims: state.claims.filter((c) => c.id !== id) }));
            break;
        }

        // Clean up connected relationships locally
        set((state) => ({
          relationships: state.relationships.filter(
            (r) => r.sourceId !== id && r.targetId !== id
          ),
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
          isInspectorOpen: state.selectedEntityId === id ? false : state.isInspectorOpen,
        }));
      } catch (err: any) {
        const msg = err.message || 'Failed to delete entity on server.';
        set({ error: msg });
        throw err;
      } finally {
        set({ isSaving: false });
      }
    },

    // Authoritative Async Relationship Creation with validation
    addRelationship: async (relData) => {
      set({ isSaving: true, error: null });
      try {
        if (!isRelationSemanticallyAllowed(relData.sourceType, relData.targetType, relData.relationType)) {
          throw new Error(
            `Semantic relation '${relData.relationType}' is invalid between ${relData.sourceType} and ${relData.targetType}.`
          );
        }

        if (wouldCreateCycle(get().relationships, relData.sourceId, relData.targetId)) {
          throw new Error('Adding this relationship creates a directed cycle in the reasoning graph.');
        }

        const newRel = await entitiesApi.createRelationship(relData);
        set((state) => ({
          relationships: [newRel, ...state.relationships],
        }));
        return newRel;
      } catch (err: any) {
        const msg = err.message || 'Failed to create relationship link.';
        set({ error: msg });
        throw err;
      } finally {
        set({ isSaving: false });
      }
    },

    // Authoritative Async Relationship Deletion
    deleteRelationship: async (id) => {
      set({ isSaving: true, error: null });
      try {
        await entitiesApi.deleteRelationship(id);
        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== id),
        }));
      } catch (err: any) {
        const msg = err.message || 'Failed to delete relationship link.';
        set({ error: msg });
        throw err;
      } finally {
        set({ isSaving: false });
      }
    },

    resetToCanonicalDataset: async () => {
      set({ isSyncing: true, error: null });
      try {
        await apiClient.post('/seed/wce', {});
        await get().syncFromBackend();
      } catch (err: any) {
        const msg = err.message || 'Failed to seed canonical dataset into database.';
        set({ error: msg });
      } finally {
        set({ isSyncing: false });
      }
    },

    // Selectors
    getAllEntities: () => {
      const state = get();
      return [
        ...state.questions,
        ...state.papers,
        ...state.gaps,
        ...state.hypotheses,
        ...state.experiments,
        ...state.results,
        ...state.decisions,
        ...state.claims,
      ];
    },

    getEntityById: (id) => {
      const all = get().getAllEntities();
      return all.find((e) => e.id === id);
    },

    getUpstreamEntities: (id) => {
      const state = get();
      const directUpstreamIds = state.relationships
        .filter((r) => r.targetId === id)
        .map((r) => r.sourceId);

      const all = state.getAllEntities();
      return all.filter((e) => directUpstreamIds.includes(e.id));
    },

    getDownstreamEntities: (id) => {
      const state = get();
      const directDownstreamIds = state.relationships
        .filter((r) => r.sourceId === id)
        .map((r) => r.targetId);

      const all = state.getAllEntities();
      return all.filter((e) => directDownstreamIds.includes(e.id));
    },

    getConnectedRelationships: (id) => {
      return get().relationships.filter((r) => r.sourceId === id || r.targetId === id);
    },

    getLiteratureMatrix: () => {
      const state = get();
      return state.papers.map((p) => {
        const metadata = p.metadata || {};
        return {
          paperId: p.id,
          paperCode: p.code,
          paperTitle: p.title,
          authors: p.authors.join(', '),
          year: p.year,
          venue: p.venue,
          methodology: metadata.methodology || 'Deep Learning / Model Compression',
          keyMetrics: metadata.keyMetrics || {
            fps: metadata.throughputFps || 28.5,
            powerWatts: metadata.powerWatts || 2.4,
            auc: metadata.auc || 0.94,
          },
          strengths: metadata.strengths || ['Strong baseline performance', 'Real-world endoscopy dataset validation'],
          limitations: metadata.limitations || [
            'Exceeds 1.2W capsule battery constraint',
            'Requires high hardware compute overhead',
          ],
        };
      });
    },

    getDiscoveredGaps: () => {
      const state = get();
      return state.gaps.map((g) => {
        const metadata = g.metadata || {};
        return {
          title: g.title,
          description: g.description,
          impactLevel: g.impactLevel,
          motivatingPaperCodes: metadata.motivatingPaperCodes || ['P-001', 'P-002'],
          proposedHypothesis:
            metadata.proposedHypothesis ||
            'Hybrid Layer-Folding and structured channel pruning enables sub-1.2W inference.',
          recommendedExperimentProtocol:
            metadata.recommendedExperimentProtocol ||
            'Evaluate INT4 quantization with folded residual blocks on 10,000 WCE frames.',
        };
      });
    },

    validateClaimAudit: (claimId) => {
      const state = get();
      const claim = state.claims.find((c) => c.id === claimId);
      if (!claim) return null;

      const incomingRels = state.relationships.filter((r) => r.targetId === claim.id);
      const supportingResults: any[] = [];
      const contradictingResults: any[] = [];
      const citingPapers: any[] = [];

      incomingRels.forEach((rel) => {
        if (rel.sourceType === 'result') {
          const res = state.results.find((r) => r.id === rel.sourceId);
          if (res) {
            if (rel.relationType === 'supports' || rel.relationType === 'validates') {
              supportingResults.push({
                id: res.id,
                code: res.code,
                title: res.title,
                summary: res.summary,
                metrics: res.metrics,
                status: res.status,
              });
            } else if (rel.relationType === 'refutes') {
              contradictingResults.push({
                id: res.id,
                code: res.code,
                title: res.title,
                summary: res.summary,
                metrics: res.metrics,
              });
            }
          }
        } else if (rel.sourceType === 'paper') {
          const p = state.papers.find((paper) => paper.id === rel.sourceId);
          if (p) {
            citingPapers.push({
              id: p.id,
              code: p.code,
              title: p.title,
              year: p.year,
              venue: p.venue,
            });
          }
        }
      });

      let supportLevel: 'strongly_supported' | 'partially_supported' | 'unsupported' | 'contradicted' = 'unsupported';
      if (contradictingResults.length > 0) {
        supportLevel = 'contradicted';
      } else if (supportingResults.length >= 2) {
        supportLevel = 'strongly_supported';
      } else if (supportingResults.length === 1) {
        supportLevel = 'partially_supported';
      }

      return {
        claimId: claim.id,
        claimCode: claim.code,
        claimStatement: claim.statement,
        currentStatus: claim.status,
        evidentiaryScore: claim.confidenceScore,
        supportLevel,
        supportingResults,
        contradictingResults,
        citingPapers,
        validationCritique:
          supportLevel === 'strongly_supported'
            ? 'Empirically substantiated across independent compression experiments without thermal degradation.'
            : 'Pending additional multi-run experimental validation.',
        recommendedActions:
          supportLevel === 'strongly_supported'
            ? ['Ready for inclusion in manuscript Section 4 Results.']
            : ['Execute ablation experiments to strengthen statistical confidence.'],
      };
    },
  };
});
