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
import {
  CANONICAL_WORKSPACE,
  INITIAL_QUESTIONS,
  INITIAL_PAPERS,
  INITIAL_GAPS,
  INITIAL_HYPOTHESES,
  INITIAL_EXPERIMENTS,
  INITIAL_RESULTS,
  INITIAL_DECISIONS,
  INITIAL_CLAIMS,
  INITIAL_RELATIONSHIPS,
} from '../data/canonicalWceData';
import { entitiesApi } from '../services/api/entities.api';
import { apiClient } from '../services/api/client';

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

  // Sync state
  isSyncing: boolean;
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

  // Entity CRUD
  addEntity: (entity: ResearchEntity) => void;
  updateEntity: (entity: ResearchEntity) => void;
  deleteEntity: (id: string, type: EntityType) => void;

  // Relationship CRUD
  addRelationship: (rel: Omit<RelationshipLink, 'id' | 'createdAt'>) => void;
  deleteRelationship: (id: string) => void;

  // Reset / Seed
  resetToCanonicalDataset: () => void;

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

const STORAGE_KEY = 'researchos_state_v1';

const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        workspace: parsed.workspace || CANONICAL_WORKSPACE,
        questions: parsed.questions || INITIAL_QUESTIONS,
        papers: parsed.papers || INITIAL_PAPERS,
        gaps: parsed.gaps || INITIAL_GAPS,
        hypotheses: parsed.hypotheses || INITIAL_HYPOTHESES,
        experiments: parsed.experiments || INITIAL_EXPERIMENTS,
        results: parsed.results || INITIAL_RESULTS,
        decisions: parsed.decisions || INITIAL_DECISIONS,
        claims: parsed.claims || INITIAL_CLAIMS,
        relationships: parsed.relationships || INITIAL_RELATIONSHIPS,
      };
    }
  } catch (e) {
    console.error('Failed to load saved state:', e);
  }

  return {
    workspace: CANONICAL_WORKSPACE,
    questions: INITIAL_QUESTIONS,
    papers: INITIAL_PAPERS,
    gaps: INITIAL_GAPS,
    hypotheses: INITIAL_HYPOTHESES,
    experiments: INITIAL_EXPERIMENTS,
    results: INITIAL_RESULTS,
    decisions: INITIAL_DECISIONS,
    claims: INITIAL_CLAIMS,
    relationships: INITIAL_RELATIONSHIPS,
  };
};

export const useResearchStore = create<ResearchStoreState>((set, get) => {
  const initialData = getInitialState();

  const persist = (nextState: Partial<ResearchStoreState>) => {
    try {
      const current = get();
      const toSave = {
        workspace: nextState.workspace || current.workspace,
        questions: nextState.questions || current.questions,
        papers: nextState.papers || current.papers,
        gaps: nextState.gaps || current.gaps,
        hypotheses: nextState.hypotheses || current.hypotheses,
        experiments: nextState.experiments || current.experiments,
        results: nextState.results || current.results,
        decisions: nextState.decisions || current.decisions,
        claims: nextState.claims || current.claims,
        relationships: nextState.relationships || current.relationships,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  };

  return {
    ...initialData,

    selectedEntityId: 'h-001',
    selectedEntityType: 'hypothesis',
    isInspectorOpen: true,

    viewMode: 'canvas',
    layoutMode: 'pipeline',
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
    syncFromBackend: async () => {
      set({ isSyncing: true });
      try {
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
          entitiesApi.listQuestions().catch(() => get().questions),
          entitiesApi.listPapers().catch(() => get().papers),
          entitiesApi.listGaps().catch(() => get().gaps),
          entitiesApi.listHypotheses().catch(() => get().hypotheses),
          entitiesApi.listExperiments().catch(() => get().experiments),
          entitiesApi.listResults().catch(() => get().results),
          entitiesApi.listDecisions().catch(() => get().decisions),
          entitiesApi.listClaims().catch(() => get().claims),
          entitiesApi.listRelationships().catch(() => get().relationships),
        ]);

        const nextState = {
          questions: questions.length ? questions : get().questions,
          papers: papers.length ? papers : get().papers,
          gaps: gaps.length ? gaps : get().gaps,
          hypotheses: hypotheses.length ? hypotheses : get().hypotheses,
          experiments: experiments.length ? experiments : get().experiments,
          results: results.length ? results : get().results,
          decisions: decisions.length ? decisions : get().decisions,
          claims: claims.length ? claims : get().claims,
          relationships: relationships.length ? relationships : get().relationships,
        };

        set(nextState);
        persist(nextState);
      } catch (err) {
        console.warn('Backend sync failed, using local storage state:', err);
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

    setViewMode: (mode) => set({ viewMode: mode }),
    setLayoutMode: (mode) => set({ layoutMode: mode }),
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

    addEntity: (entity) => {
      // Async persist to backend API
      const collectionName = `${entity.type}s` as any;
      if ((entitiesApi as any)[`create${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}`]) {
        (entitiesApi as any)[`create${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}`](entity).catch(
          (err: any) => console.warn('Background entity API create error:', err)
        );
      }

      set((state) => {
        let updated: Partial<ResearchStoreState> = {};
        switch (entity.type) {
          case 'question':
            updated = { questions: [entity as ResearchQuestionEntity, ...state.questions] };
            break;
          case 'paper':
            updated = { papers: [entity as PaperEntity, ...state.papers] };
            break;
          case 'gap':
            updated = { gaps: [entity as GapEntity, ...state.gaps] };
            break;
          case 'hypothesis':
            updated = { hypotheses: [entity as HypothesisEntity, ...state.hypotheses] };
            break;
          case 'experiment':
            updated = { experiments: [entity as ExperimentEntity, ...state.experiments] };
            break;
          case 'result':
            updated = { results: [entity as ResultEntity, ...state.results] };
            break;
          case 'decision':
            updated = { decisions: [entity as DecisionEntity, ...state.decisions] };
            break;
          case 'claim':
            updated = { claims: [entity as ClaimEntity, ...state.claims] };
            break;
        }
        persist(updated);
        return {
          ...updated,
          selectedEntityId: entity.id,
          selectedEntityType: entity.type,
          isInspectorOpen: true,
        };
      });
    },

    updateEntity: (entity) => {
      // Async persist to backend API
      const updateMethod = `update${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}`;
      if ((entitiesApi as any)[updateMethod]) {
        (entitiesApi as any)[updateMethod](entity.id, entity).catch((err: any) =>
          console.warn('Background entity API update error:', err)
        );
      }

      set((state) => {
        let updated: Partial<ResearchStoreState> = {};
        switch (entity.type) {
          case 'question':
            updated = {
              questions: state.questions.map((q) => (q.id === entity.id ? (entity as ResearchQuestionEntity) : q)),
            };
            break;
          case 'paper':
            updated = {
              papers: state.papers.map((p) => (p.id === entity.id ? (entity as PaperEntity) : p)),
            };
            break;
          case 'gap':
            updated = {
              gaps: state.gaps.map((g) => (g.id === entity.id ? (entity as GapEntity) : g)),
            };
            break;
          case 'hypothesis':
            updated = {
              hypotheses: state.hypotheses.map((h) => (h.id === entity.id ? (entity as HypothesisEntity) : h)),
            };
            break;
          case 'experiment':
            updated = {
              experiments: state.experiments.map((e) => (e.id === entity.id ? (entity as ExperimentEntity) : e)),
            };
            break;
          case 'result':
            updated = {
              results: state.results.map((r) => (r.id === entity.id ? (entity as ResultEntity) : r)),
            };
            break;
          case 'decision':
            updated = {
              decisions: state.decisions.map((d) => (d.id === entity.id ? (entity as DecisionEntity) : d)),
            };
            break;
          case 'claim':
            updated = {
              claims: state.claims.map((c) => (c.id === entity.id ? (entity as ClaimEntity) : c)),
            };
            break;
        }
        persist(updated);
        return updated;
      });
    },

    deleteEntity: (id, type) => {
      // Async persist to backend API
      const deleteMethod = `delete${type.charAt(0).toUpperCase() + type.slice(1)}`;
      if ((entitiesApi as any)[deleteMethod]) {
        (entitiesApi as any)[deleteMethod](id).catch((err: any) =>
          console.warn('Background entity API delete error:', err)
        );
      }

      set((state) => {
        let updated: Partial<ResearchStoreState> = {};
        switch (type) {
          case 'question':
            updated = { questions: state.questions.filter((q) => q.id !== id) };
            break;
          case 'paper':
            updated = { papers: state.papers.filter((p) => p.id !== id) };
            break;
          case 'gap':
            updated = { gaps: state.gaps.filter((g) => g.id !== id) };
            break;
          case 'hypothesis':
            updated = { hypotheses: state.hypotheses.filter((h) => h.id !== id) };
            break;
          case 'experiment':
            updated = { experiments: state.experiments.filter((e) => e.id !== id) };
            break;
          case 'result':
            updated = { results: state.results.filter((r) => r.id !== id) };
            break;
          case 'decision':
            updated = { decisions: state.decisions.filter((d) => d.id !== id) };
            break;
          case 'claim':
            updated = { claims: state.claims.filter((c) => c.id !== id) };
            break;
        }
        // Also remove cascade relationships
        const filteredRels = state.relationships.filter(
          (r) => r.sourceId !== id && r.targetId !== id
        );
        updated.relationships = filteredRels;

        persist(updated);
        return {
          ...updated,
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
          isInspectorOpen: state.selectedEntityId === id ? false : state.isInspectorOpen,
        };
      });
    },

    addRelationship: (relData) => {
      const tempId = `rel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newRel: RelationshipLink = {
        ...relData,
        id: tempId,
        createdAt: new Date().toISOString(),
      };

      // Async persist to backend API
      entitiesApi.createRelationship(relData).catch((err) =>
        console.warn('Background relationship API create error:', err)
      );

      set((state) => {
        const exists = state.relationships.some(
          (r) =>
            r.sourceId === newRel.sourceId &&
            r.targetId === newRel.targetId &&
            r.relationType === newRel.relationType
        );
        if (exists) return state;

        const updated = { relationships: [...state.relationships, newRel] };
        persist(updated);
        return updated;
      });
    },

    deleteRelationship: (id) => {
      entitiesApi.deleteRelationship(id).catch((err) =>
        console.warn('Background relationship API delete error:', err)
      );

      set((state) => {
        const updated = {
          relationships: state.relationships.filter((r) => r.id !== id),
        };
        persist(updated);
        return updated;
      });
    },

    resetToCanonicalDataset: () => {
      apiClient.post('/seed').catch(() => {});
      localStorage.removeItem(STORAGE_KEY);
      set({
        workspace: CANONICAL_WORKSPACE,
        questions: INITIAL_QUESTIONS,
        papers: INITIAL_PAPERS,
        gaps: INITIAL_GAPS,
        hypotheses: INITIAL_HYPOTHESES,
        experiments: INITIAL_EXPERIMENTS,
        results: INITIAL_RESULTS,
        decisions: INITIAL_DECISIONS,
        claims: INITIAL_CLAIMS,
        relationships: INITIAL_RELATIONSHIPS,
        selectedEntityId: 'h-001',
        selectedEntityType: 'hypothesis',
        isInspectorOpen: true,
      });
    },

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

    getEntityById: (id: string) => {
      const all = get().getAllEntities();
      return all.find((e) => e.id === id);
    },

    getUpstreamEntities: (id: string) => {
      const rels = get().relationships;
      const all = get().getAllEntities();
      const parentIds = rels.filter((r) => r.targetId === id).map((r) => r.sourceId);
      return all.filter((e) => parentIds.includes(e.id));
    },

    getDownstreamEntities: (id: string) => {
      const rels = get().relationships;
      const all = get().getAllEntities();
      const childIds = rels.filter((r) => r.sourceId === id).map((r) => r.targetId);
      return all.filter((e) => childIds.includes(e.id));
    },

    getConnectedRelationships: (id: string) => {
      const rels = get().relationships;
      return rels.filter((r) => r.sourceId === id || r.targetId === id);
    },

    getLiteratureMatrix: () => {
      const papers = get().papers;
      return papers.map((p) => {
        const text = `${p.abstract || ''} ${p.notes || ''}`.toLowerCase();
        let methodology = 'Transformer / Edge Architecture Optimization';
        if (text.includes('quantiz') || text.includes('int4')) {
          methodology = 'Low-Bit Integer Quantization (INT4/INT8)';
        } else if (text.includes('patch fold') || text.includes('sparsif')) {
          methodology = 'Spatial Patch Folding & Token Sparsification';
        } else if (text.includes('thermal') || text.includes('dissipation')) {
          methodology = 'In-Vivo Bio-Thermal Profiling & Micro-Electronics Safety';
        }

        const keyMetrics: Record<string, any> = {};
        if (p.code === 'P-001') keyMetrics.powerEnvelope = '>12W (Standard ViT Bottleneck)';
        if (p.code === 'P-002') keyMetrics.compression = '3.8x Memory Reduction / -7.2% Sensitivity';
        if (p.code === 'P-003') keyMetrics.compression = '50% Token Sparsification / Boundary Retained';
        if (p.code === 'P-004') keyMetrics.powerBudget = '<= 2.4W Continuous / Max 41.5°C Shell';

        const strengths: string[] = [];
        const limitations: string[] = [];

        if (p.code === 'P-001') {
          strengths.push('Rigorous benchmark of multi-center WCE polyp & bleeding datasets');
          limitations.push('Full-precision attention causes immediate thermal shutdown in closed capsules');
        } else if (p.code === 'P-002') {
          strengths.push('Demonstrates lightweight integer arithmetic on microcontrollers');
          limitations.push('Uniform activation outlier clipping destroys sub-millimeter mucosal vascular gradients');
        } else if (p.code === 'P-003') {
          strengths.push('Mathematically preserves boundary gradient variance prior to linear projections');
          limitations.push('Requires custom hardware kernel implementations on edge NPUs');
        } else if (p.code === 'P-004') {
          strengths.push('Empirically defines in-vivo clinical tissue damage threshold in gastrointestinal lumens');
          limitations.push('Imposes an uncompromising 2.5W thermal dissipation ceiling on all edge models');
        }

        return {
          paperId: p.id,
          paperCode: p.code,
          paperTitle: p.title,
          authors: p.authors.join(', '),
          year: p.year,
          venue: p.venue,
          methodology,
          keyMetrics,
          strengths,
          limitations,
        };
      });
    },

    getDiscoveredGaps: () => {
      const papers = get().papers;
      const codes = papers.map((p) => p.code);
      return [
        {
          title: 'Dynamic Token Gating for Non-Pathological Mucosa Frames',
          description:
            'Over 88% of small intestine endoscopic frames contain healthy mucosa. Executing full multi-head Transformer attention on every frame drains 70% of the capsule battery.',
          impactLevel: 'high',
          motivatingPaperCodes: codes.filter((c) => ['P-001', 'P-004'].includes(c)),
          proposedHypothesis:
            'A 2-stage lightweight gating network that dynamically throttles deep attention on normal frames cuts energy draw by 42% while retaining 100% bleeding recall.',
          recommendedExperimentProtocol:
            'Train lightweight MobileNetV4 gate on Kvasir-Capsule; profile power consumption on Jetson Nano across 20 full-length 8-hour video feeds.',
        },
        {
          title: 'Activation Outlier Channel Splitting for 4-bit Quantization',
          description:
            'Mucosal lesion color boundaries create isolated channel activation outliers in Transformer MLP blocks. Uniform per-tensor INT4 quantization crushes these channels, causing false negative diagnostic predictions.',
          impactLevel: 'critical',
          motivatingPaperCodes: codes.filter((c) => ['P-002', 'P-003'].includes(c)),
          proposedHypothesis:
            'Channel-splitting the top 1.5% activation outliers into dedicated INT8 paths while quantizing 98.5% of weights to INT4 recovers full FP32 AUC while maintaining 45+ FPS.',
          recommendedExperimentProtocol:
            'Implement mixed-precision kernel in TensorRT / TVM; benchmark ROC-AUC curve on subtle vascular ectasias.',
        },
        {
          title: 'Adaptive Frame-Rate Throttling Governed by Ingestible Transit Velocity',
          description:
            'Capsule speed varies between 0.2 cm/s in the duodenum to 4.5 cm/s in the ileum. Fixed 45 FPS capture results in unnecessary duplicate frames during peristaltic stagnation.',
          impactLevel: 'medium',
          motivatingPaperCodes: codes.filter((c) => ['P-001', 'P-004'].includes(c)),
          proposedHypothesis:
            'Optical flow-based peristaltic motion estimation on-chip allows dynamic throttling between 10 FPS (stagnant) and 60 FPS (rapid transit), preserving battery life for full 10-hour transit.',
          recommendedExperimentProtocol:
            'Simulate realistic peristaltic velocity profiles in robotic bowel model; measure total battery duration and mucosal coverage percentage.',
        },
      ];
    },

    validateClaimAudit: (claimId: string) => {
      const state = get();
      const claim = state.claims.find((c) => c.id === claimId);
      if (!claim) return null;

      const rels = state.relationships;
      const supportingResultIds = rels
        .filter((r) => r.targetId === claim.id && r.sourceType === 'result' && ['supports', 'produces', 'validates'].includes(r.relationType))
        .map((r) => r.sourceId);

      const contradictingResultIds = rels
        .filter((r) => r.targetId === claim.id && r.sourceType === 'result' && ['refutes', 'contradicts'].includes(r.relationType))
        .map((r) => r.sourceId);

      const citingPaperIds = rels
        .filter((r) => r.targetId === claim.id && r.sourceType === 'paper' && r.relationType === 'cites')
        .map((r) => r.sourceId);

      const supportingResults = state.results
        .filter((r) => supportingResultIds.includes(r.id))
        .map((r) => ({
          id: r.id,
          code: r.code,
          title: r.title,
          summary: r.summary,
          metrics: r.metrics,
          status: r.status,
        }));

      const contradictingResults = state.results
        .filter((r) => contradictingResultIds.includes(r.id))
        .map((r) => ({
          id: r.id,
          code: r.code,
          title: r.title,
          summary: r.summary,
          metrics: r.metrics,
        }));

      const citingPapers = state.papers
        .filter((p) => citingPaperIds.includes(p.id))
        .map((p) => ({
          id: p.id,
          code: p.code,
          title: p.title,
          year: p.year,
          venue: p.venue,
        }));

      let supportLevel: ClaimValidationAudit['supportLevel'] = 'unsupported';
      let evidentiaryScore = 0.3;
      let critique = 'Claim currently lacks directly linked empirical results in the workspace graph.';
      let actions = ['Design and link an experiment to generate validating results'];

      if (contradictingResults.length > 0) {
        supportLevel = 'contradicted';
        evidentiaryScore = 0.2;
        critique = `Claim is contradicted by ${contradictingResults.length} empirical result(s) exceeding safety or accuracy limits.`;
        actions = ['Re-evaluate claim boundaries', 'Execute clarifying benchmark experiments'];
      } else if (supportingResults.length >= 2) {
        supportLevel = 'strongly_supported';
        evidentiaryScore = Math.min(0.98, 0.85 + 0.05 * supportingResults.length);
        critique = `Claim is backed by ${supportingResults.length} multi-modal empirical results with verified metrics (e.g. throughput, thermal profiling).`;
        actions = ['Ready for publication and decision adoption', 'Include in master claims table'];
      } else if (supportingResults.length === 1) {
        supportLevel = 'partially_supported';
        evidentiaryScore = 0.75;
        critique = 'Claim has 1 supporting empirical result. Additional replication on independent datasets is recommended.';
        actions = ['Conduct second independent trial', 'Cross-validate on external clinical datasets'];
      }

      return {
        claimId: claim.id,
        claimCode: claim.code,
        claimStatement: claim.statement,
        currentStatus: claim.status,
        evidentiaryScore,
        supportLevel,
        supportingResults,
        contradictingResults,
        citingPapers,
        validationCritique: critique,
        recommendedActions: actions,
      };
    },
  };
});
