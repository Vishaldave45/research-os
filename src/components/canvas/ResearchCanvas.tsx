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
    evidence,
    datasets,
    models,
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
      ...evidence,
      ...datasets,
      ...models,
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
      evidence: 260,
      dataset: 260,
      model: 1140,
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
      evidence: 0,
      dataset: 0,
      model: 0,
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
          evidence: { col: 1, row: 0 },
          dataset: { col: 1, row: 1 },
          gap: { col: 2, row: 0 },
          hypothesis: { col: 2, row: 1 },
          model: { col: 3, row: 0 },
          experiment: { col: 3, row: 1 },
          result: { col: 4, row: 0 },
          decision: { col: 4, row: 1 },
          claim: { col: 5, row: 0 },
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
        evidence.length +
        datasets.length +
        models.length +
        gaps.length +
        hypotheses.length +
        experiments.length +
        results.length +
        decisions.length +
        claims.length,
    },
    { key: 'question', label: 'Questions', count: questions.length },
    { key: 'paper', label: 'Papers', count: papers.length },
    { key: 'evidence', label: 'Evidence', count: evidence.length },
    { key: 'dataset', label: 'Datasets', count: datasets.length },
    { key: 'model', label: 'Models', count: models.length },
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

        {/* Top Floating Control Bar - Left & Right Organized */}
        <Panel position="top-left" className="!m-0 !top-3.5 !left-3.5 !right-3.5 !w-[calc(100%-1.75rem)] !max-w-none z-20 pointer-events-none">
          <div className="flex items-center justify-between gap-3 w-full">
            {/* LEFT SIDE: Filter Pill Bar + Quick Search */}
            <div className="flex items-center gap-2 pointer-events-auto min-w-0">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1 rounded-full border border-slate-200/90 bg-white/95 p-1 shadow-xs backdrop-blur-md overflow-x-auto no-scrollbar max-w-[calc(100vw-360px)] lg:max-w-none">
                <div className="flex items-center pl-2.5 pr-1 text-slate-400">
                  <Filter className="h-3.5 w-3.5" />
                </div>
                {filterOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setTypeFilter(opt.key)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      typeFilter === opt.key
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        typeFilter === opt.key ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick Search */}
              <div className="hidden xl:flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1.5 shadow-xs backdrop-blur-md">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 lg:w-40 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full px-1.5 py-0.2 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Layout Toggle + Add Node */}
            <div className="flex items-center gap-2 pointer-events-auto shrink-0">
              {/* Layout Toggle */}
              <div className="flex items-center gap-1 rounded-full border border-slate-200/90 bg-white/95 p-1 shadow-xs backdrop-blur-md">
                <button
                  onClick={() => setLayoutMode('pipeline')}
                  title="Hierarchical Reasoning Pipeline"
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    layoutMode === 'pipeline'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <GitFork className="h-3.5 w-3.5" />
                  <span>Pipeline View</span>
                </button>
                <button
                  onClick={() => setLayoutMode('grouped')}
                  title="Grouped Archetype Clusters"
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    layoutMode === 'grouped'
                      ? 'bg-slate-900 text-white shadow-2xs'
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
                className="flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Node</span>
              </button>
            </div>
          </div>
        </Panel>

        {/* Pipeline Column Guides (when in pipeline layout) */}
        {layoutMode === 'pipeline' && (
          <Panel position="bottom-left" className="m-3.5">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2 text-[11px] font-semibold text-slate-500 shadow-sm backdrop-blur-md">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <span className="h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
                1. Clinical Questions & Papers
              </span>
              <span className="text-slate-300">→</span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-100" />
                2. Formulated Gaps
              </span>
              <span className="text-slate-300">→</span>
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="h-2 w-2 rounded-full bg-teal-500 ring-2 ring-teal-100" />
                3. Hypotheses
              </span>
              <span className="text-slate-300">→</span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-100" />
                4. Experiments
              </span>
              <span className="text-slate-300">→</span>
              <span className="flex items-center gap-1.5 text-cyan-700">
                <span className="h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-cyan-100" />
                5. Results
              </span>
              <span className="text-slate-300">→</span>
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="h-2 w-2 rounded-full bg-purple-500 ring-2 ring-purple-100" />
                6. Decisions & Claims
              </span>
            </div>
          </Panel>
        )}

        {/* Empty Workspace State */}
        {nodes.length === 0 && (
          <Panel position="top-center" className="mt-32">
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-2xl backdrop-blur-md max-w-md text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 ring-8 ring-indigo-50/50">
                <Layers className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Research Graph is Empty</h3>
              <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed">
                No research entities found in this workspace. Start by adding a research inquiry or seed the canonical WCE depth-reduction dataset.
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
