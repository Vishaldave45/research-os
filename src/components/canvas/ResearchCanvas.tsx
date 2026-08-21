import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
  Panel,
} from '@xyflow/react';
import {
  Layers,
  Sparkles,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Maximize2,
  GitFork,
  CheckCircle2,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { QuestionNode } from './nodes/QuestionNode';
import { PaperNode } from './nodes/PaperNode';
import { GapNode } from './nodes/GapNode';
import { HypothesisNode } from './nodes/HypothesisNode';
import { ExperimentNode } from './nodes/ExperimentNode';
import { ResultNode } from './nodes/ResultNode';
import { DecisionNode } from './nodes/DecisionNode';
import { ClaimNode } from './nodes/ClaimNode';
import { CustomEdge } from './CustomEdge';
import { EntityType, ResearchEntity, RelationType } from '../../types/research';

const nodeTypes = {
  question: QuestionNode,
  paper: PaperNode,
  gap: GapNode,
  hypothesis: HypothesisNode,
  experiment: ExperimentNode,
  result: ResultNode,
  decision: DecisionNode,
  claim: ClaimNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export const ResearchCanvas: React.FC = () => {
  const {
    questions,
    papers,
    gaps,
    hypotheses,
    experiments,
    results,
    decisions,
    claims,
    relationships,
    selectedEntityId,
    selectEntity,
    addRelationship,
    layoutMode,
    setLayoutMode,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    openCreateModal,
    openLinkModal,
    resetToCanonicalDataset,
  } = useResearchStore();

  // Compute graph nodes with coordinates based on layout mode
  const { initialNodes, initialEdges } = useMemo(() => {
    const allEntities: ResearchEntity[] = [
      ...questions,
      ...papers,
      ...gaps,
      ...hypotheses,
      ...experiments,
      ...results,
      ...decisions,
      ...claims,
    ];

    // Filter by type if active
    const filteredEntities = allEntities.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${e.code} ${e.title} ${
          e.type === 'hypothesis'
            ? e.statement
            : e.type === 'gap'
            ? e.description
            : e.type === 'result'
            ? e.summary
            : ''
        }`.toLowerCase();
        return text.includes(q);
      }
      return true;
    });

    // Pipeline Layout Column Positioning
    const columnX: Record<EntityType, number> = {
      paper: 50,
      question: 50,
      gap: 480,
      hypothesis: 920,
      experiment: 1380,
      result: 1840,
      decision: 2320,
      claim: 2800,
    };

    const typeCounters: Record<EntityType, number> = {
      paper: 0,
      question: 0,
      gap: 0,
      hypothesis: 0,
      experiment: 0,
      result: 0,
      decision: 0,
      claim: 0,
    };

    const nodes: Node[] = filteredEntities.map((entity) => {
      let x = 0;
      let y = 0;

      if (layoutMode === 'pipeline') {
        const col = columnX[entity.type] || 0;
        const rowIndex = typeCounters[entity.type]++;
        x = col;
        // Paper and Question share column 0 with slight offset
        if (entity.type === 'question') {
          y = rowIndex * 220 + 20;
        } else if (entity.type === 'paper') {
          y = rowIndex * 220 + (questions.length > 0 ? questions.length * 200 + 40 : 20);
        } else {
          y = rowIndex * 220 + 40;
        }
      } else if (layoutMode === 'grouped') {
        const typeIndexMap: Record<EntityType, { col: number; row: number }> = {
          question: { col: 0, row: 0 },
          paper: { col: 0, row: 1 },
          gap: { col: 1, row: 0 },
          hypothesis: { col: 1, row: 1 },
          experiment: { col: 2, row: 0 },
          result: { col: 2, row: 1 },
          decision: { col: 3, row: 0 },
          claim: { col: 3, row: 1 },
        };
        const pos = typeIndexMap[entity.type] || { col: 0, row: 0 };
        const indexInGroup = typeCounters[entity.type]++;
        x = pos.col * 460 + 50;
        y = pos.row * 500 + indexInGroup * 180 + 40;
      } else {
        const idx = filteredEntities.indexOf(entity);
        x = (idx % 4) * 440 + 50;
        y = Math.floor(idx / 4) * 260 + 50;
      }

      return {
        id: entity.id,
        type: entity.type,
        position: { x, y },
        data: { entity },
        selected: selectedEntityId === entity.id,
      };
    });

    const activeNodeIds = new Set(filteredEntities.map((e) => e.id));

    const edges: Edge[] = relationships
      .filter((r) => activeNodeIds.has(r.sourceId) && activeNodeIds.has(r.targetId))
      .map((r) => ({
        id: r.id,
        source: r.sourceId,
        target: r.targetId,
        type: 'custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color:
            r.relationType === 'refutes'
              ? '#e11d48'
              : r.relationType === 'supports'
              ? '#059669'
              : '#6366f1',
        },
        data: {
          relationType: r.relationType,
          sourceId: r.sourceId,
          targetId: r.targetId,
        },
      }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [
    questions,
    papers,
    gaps,
    hypotheses,
    experiments,
    results,
    decisions,
    claims,
    relationships,
    selectedEntityId,
    layoutMode,
    typeFilter,
    searchQuery,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state changes from store
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectEntity(node.id, node.type as EntityType);
    },
    [selectEntity]
  );

  const onPaneClick = useCallback(() => {
    selectEntity(null);
  }, [selectEntity]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const sourceEntity = useResearchStore.getState().getEntityById(connection.source);
      const targetEntity = useResearchStore.getState().getEntityById(connection.target);
      if (!sourceEntity || !targetEntity) return;

      // Smart default relation type based on source & target types
      let relationType: RelationType = 'informs';
      if (sourceEntity.type === 'paper' && targetEntity.type === 'question') relationType = 'cites';
      else if (sourceEntity.type === 'paper' && targetEntity.type === 'gap') relationType = 'informs';
      else if (sourceEntity.type === 'gap' && targetEntity.type === 'hypothesis') relationType = 'motivates';
      else if (sourceEntity.type === 'hypothesis' && targetEntity.type === 'question') relationType = 'addresses';
      else if (sourceEntity.type === 'experiment' && targetEntity.type === 'hypothesis') relationType = 'tests';
      else if (sourceEntity.type === 'result' && targetEntity.type === 'hypothesis') relationType = 'supports';
      else if (sourceEntity.type === 'result' && targetEntity.type === 'decision') relationType = 'informs';
      else if (sourceEntity.type === 'result' && targetEntity.type === 'claim') relationType = 'supports';
      else if (sourceEntity.type === 'claim' && targetEntity.type === 'hypothesis') relationType = 'derived_from';

      addRelationship({
        sourceId: sourceEntity.id,
        sourceType: sourceEntity.type,
        targetId: targetEntity.id,
        targetType: targetEntity.type,
        relationType,
      });
    },
    [addRelationship]
  );

  const filterOptions: Array<{ key: EntityType | 'all'; label: string; count: number }> = [
    {
      key: 'all',
      label: 'All Nodes',
      count:
        questions.length +
        papers.length +
        gaps.length +
        hypotheses.length +
        experiments.length +
        results.length +
        decisions.length +
        claims.length,
    },
    { key: 'question', label: 'Questions', count: questions.length },
    { key: 'paper', label: 'Papers', count: papers.length },
    { key: 'gap', label: 'Gaps', count: gaps.length },
    { key: 'hypothesis', label: 'Hypotheses', count: hypotheses.length },
    { key: 'experiment', label: 'Experiments', count: experiments.length },
    { key: 'result', label: 'Results', count: results.length },
    { key: 'decision', label: 'Decisions', count: decisions.length },
    { key: 'claim', label: 'Claims', count: claims.length },
  ];

  return (
    <div className="relative h-full w-full bg-slate-900/5 select-none overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultEdgeOptions={{ type: 'custom' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} className="!bg-white !border-slate-200 !shadow-sm !rounded-xl" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bottom-4 !right-4 !rounded-xl !border !border-slate-200 !shadow-sm !bg-white/90"
        />

        {/* Top Control Bar Panel */}
        <Panel position="top-left" className="m-3 flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-xs backdrop-blur">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search code or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[10px] text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xs backdrop-blur">
            <Filter className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTypeFilter(opt.key)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  typeFilter === opt.key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    typeFilter === opt.key ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            ))}
          </div>
        </Panel>

        {/* Top Right Layout and Action Bar */}
        <Panel position="top-right" className="m-3 flex items-center gap-2">
          {/* Layout Toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xs backdrop-blur">
            <button
              onClick={() => setLayoutMode('pipeline')}
              title="Hierarchical Reasoning Pipeline"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                layoutMode === 'pipeline'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <GitFork className="h-3.5 w-3.5" />
              <span>Pipeline View</span>
            </button>
            <button
              onClick={() => setLayoutMode('grouped')}
              title="Grouped Archetype Clusters"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                layoutMode === 'grouped'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Clustered</span>
            </button>
          </div>

          {/* Quick Add Node Button */}
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Node</span>
          </button>
        </Panel>

        {/* Pipeline Column Guides (when in pipeline layout) */}
        {layoutMode === 'pipeline' && (
          <Panel position="bottom-left" className="m-3">
            <div className="flex items-center gap-6 rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-[11px] font-medium text-slate-500 shadow-xs backdrop-blur">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                1. Questions & Literature
              </span>
              <span>→</span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                2. Research Gaps
              </span>
              <span>→</span>
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                3. Hypotheses
              </span>
              <span>→</span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                4. Experiments
              </span>
              <span>→</span>
              <span className="flex items-center gap-1.5 text-cyan-700">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                5. Results
              </span>
              <span>→</span>
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                6. Decisions & Claims
              </span>
            </div>
          </Panel>
        )}

        {/* Empty Workspace State */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="mt-32">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-xl backdrop-blur max-w-md text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Research Graph is Empty</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                No research entities found in this workspace. Start by adding a research question or seed the canonical WCE depth-reduction dataset.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => openCreateModal()}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Node</span>
                </button>
                <button
                  onClick={() => resetToCanonicalDataset()}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span>Seed Canonical Dataset</span>
                </button>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
