import { dbEngine, DBEntity, DBRelationship } from '../db/database';

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
  decision: DBEntity;
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

export function computeDecisionBackwardTrace(
  workspaceId: string,
  decisionId: string
): BackwardTraceResponse | null {
  const db = dbEngine.getDb();

  const decision = db.decisions.find(
    (d) => d.workspace_id === workspaceId && (d.id === decisionId || d.code === decisionId)
  );

  if (!decision) return null;

  const allEntitiesMap: Map<string, DBEntity> = new Map();
  [
    ...db.questions,
    ...db.papers,
    ...db.gaps,
    ...db.hypotheses,
    ...db.experiments,
    ...db.results,
    ...db.decisions,
    ...db.claims,
  ]
    .filter((e) => e.workspace_id === workspaceId)
    .forEach((e) => allEntitiesMap.set(e.id, e));

  const workspaceRels = db.relationships.filter((r) => r.workspace_id === workspaceId);

  // Traverse backward using BFS
  const visitedNodeIds = new Set<string>();
  const traceEdges: TraceEdge[] = [];
  const nodeLevels = new Map<string, number>();

  visitedNodeIds.add(decision.id);
  nodeLevels.set(decision.id, 0);

  const queue: Array<{ id: string; level: number }> = [{ id: decision.id, level: 0 }];

  while (queue.length > 0) {
    const { id: currentId, level } = queue.shift()!;

    // Find all incoming relationships where current is the target
    const incoming = workspaceRels.filter((r) => r.target_id === currentId);
    for (const rel of incoming) {
      traceEdges.push({
        id: rel.id,
        sourceId: rel.source_id,
        targetId: rel.target_id,
        relationType: rel.relation_type,
      });

      if (!visitedNodeIds.has(rel.source_id)) {
        visitedNodeIds.add(rel.source_id);
        nodeLevels.set(rel.source_id, level + 1);
        queue.push({ id: rel.source_id, level: level + 1 });
      }
    }

    // Also find bidirectional antecedent relationships if any
    const outgoingAsSource = workspaceRels.filter(
      (r) => r.source_id === currentId && ['derived_from', 'produced_by'].includes(r.relation_type)
    );
    for (const rel of outgoingAsSource) {
      traceEdges.push({
        id: rel.id,
        sourceId: rel.source_id,
        targetId: rel.target_id,
        relationType: rel.relation_type,
      });

      if (!visitedNodeIds.has(rel.target_id)) {
        visitedNodeIds.add(rel.target_id);
        nodeLevels.set(rel.target_id, level + 1);
        queue.push({ id: rel.target_id, level: level + 1 });
      }
    }
  }

  const nodes: TraceNode[] = [];
  let resultsCount = 0;
  let experimentsCount = 0;
  let hypothesesCount = 0;
  let gapsCount = 0;
  let questionsCount = 0;
  let papersCount = 0;

  for (const id of visitedNodeIds) {
    const entity = allEntitiesMap.get(id);
    if (!entity) continue;

    const level = nodeLevels.get(id) || 0;
    nodes.push({
      id: entity.id,
      code: entity.code,
      type: entity.type,
      title: entity.title || entity.statement || entity.summary || entity.description,
      status: entity.status,
      outcome: entity.outcome,
      metrics: entity.metrics,
      confidence: entity.confidence,
      confidenceScore: entity.confidenceScore,
      level,
    });

    if (entity.type === 'result') resultsCount++;
    if (entity.type === 'experiment') experimentsCount++;
    if (entity.type === 'hypothesis') hypothesesCount++;
    if (entity.type === 'gap') gapsCount++;
    if (entity.type === 'question') questionsCount++;
    if (entity.type === 'paper') papersCount++;
  }

  // Sort nodes from earliest provenance (highest level) to decision (level 0)
  nodes.sort((a, b) => b.level - a.level);

  const rootPath = nodes.map((n) => `[${n.code}] ${n.type.toUpperCase()}: ${n.title.slice(0, 40)}`);

  const isFullyGrounded =
    resultsCount > 0 &&
    experimentsCount > 0 &&
    hypothesesCount > 0 &&
    (papersCount > 0 || gapsCount > 0);

  const verificationScore = isFullyGrounded ? 0.96 : 0.65;

  return {
    decision,
    rootPath,
    nodes,
    edges: traceEdges,
    summary: {
      totalEntitiesInChain: nodes.length,
      resultsCount,
      experimentsCount,
      hypothesesCount,
      gapsCount,
      questionsCount,
      papersCount,
      isFullyGrounded,
      verificationScore,
    },
  };
}
