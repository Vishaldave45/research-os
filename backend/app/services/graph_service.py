import uuid
from datetime import datetime, timezone
from typing import Dict, List, Set, Tuple, Optional, Any, Literal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.relationship import Relationship
from app.schemas.graph import (
    RelationshipCreate,
    RelationshipRead,
    GraphNode,
    GraphEdge,
    GraphResponse,
    GraphStats,
    LineageTrace,
    LineagePath,
    OrphanItem,
    OrphanAuditReport,
)
from app.repositories.relationship_repository import RelationshipRepository
from app.repositories.research_question_and_paper_repository import (
    ResearchQuestionRepository,
    PaperRepository,
)
from app.repositories.gap_and_hypothesis_repository import (
    GapRepository,
    HypothesisRepository,
)
from app.repositories.experiment_and_claim_repository import (
    ExperimentRepository,
    ResultRepository,
    ClaimRepository,
)
from app.repositories.decision_repository import DecisionRepository


class GraphService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rel_repo = RelationshipRepository(db)
        self.question_repo = ResearchQuestionRepository(db)
        self.paper_repo = PaperRepository(db)
        self.gap_repo = GapRepository(db)
        self.hypothesis_repo = HypothesisRepository(db)
        self.experiment_repo = ExperimentRepository(db)
        self.result_repo = ResultRepository(db)
        self.decision_repo = DecisionRepository(db)
        self.claim_repo = ClaimRepository(db)

    async def _fetch_all_nodes(self, workspace_id: uuid.UUID) -> Dict[str, GraphNode]:
        """Fetch all research entities in the workspace and format as GraphNodes."""
        nodes: Dict[str, GraphNode] = {}

        # 1. Questions
        questions = await self.question_repo.list(workspace_id)
        for q in questions:
            nodes[str(q.id)] = GraphNode(
                id=str(q.id),
                type="question",
                code=q.code,
                label=q.title,
                status=q.status,
                metadata=q.metadata_json,
                created_at=q.created_at,
            )

        # 2. Papers
        papers = await self.paper_repo.list(workspace_id)
        for p in papers:
            nodes[str(p.id)] = GraphNode(
                id=str(p.id),
                type="paper",
                code=p.code,
                label=p.title,
                status=str(p.year) if p.year else None,
                metadata=p.metadata_json,
                created_at=p.created_at,
            )

        # 3. Gaps
        gaps = await self.gap_repo.list(workspace_id)
        for g in gaps:
            nodes[str(g.id)] = GraphNode(
                id=str(g.id),
                type="gap",
                code=g.code,
                label=g.title,
                status=g.impact_level,
                metadata=g.metadata_json,
                created_at=g.created_at,
            )

        # 4. Hypotheses
        hypotheses = await self.hypothesis_repo.list(workspace_id)
        for h in hypotheses:
            nodes[str(h.id)] = GraphNode(
                id=str(h.id),
                type="hypothesis",
                code=h.code,
                label=h.statement,
                status=h.status,
                metadata=h.metadata_json,
                created_at=h.created_at,
            )

        # 5. Experiments
        experiments = await self.experiment_repo.list(workspace_id)
        for e in experiments:
            nodes[str(e.id)] = GraphNode(
                id=str(e.id),
                type="experiment",
                code=e.code,
                label=e.title,
                status=e.status,
                metadata=e.config,
                created_at=e.created_at,
            )

        # 6. Results
        results = await self.result_repo.list(workspace_id)
        for r in results:
            nodes[str(r.id)] = GraphNode(
                id=str(r.id),
                type="result",
                code=r.code,
                label=r.title,
                status=r.status,
                metadata=r.metrics,
                created_at=r.created_at,
            )

        # 7. Decisions
        decisions = await self.decision_repo.list(workspace_id)
        for d in decisions:
            nodes[str(d.id)] = GraphNode(
                id=str(d.id),
                type="decision",
                code=d.code,
                label=d.title,
                status=d.outcome,
                metadata=d.metadata_json,
                created_at=d.created_at,
            )

        # 8. Claims
        claims = await self.claim_repo.list(workspace_id)
        for c in claims:
            nodes[str(c.id)] = GraphNode(
                id=str(c.id),
                type="claim",
                code=c.code,
                label=c.statement,
                status=c.status,
                metadata={"confidence_score": c.confidence_score, **c.metadata_json},
                created_at=c.created_at,
            )

        return nodes

    async def get_full_graph(self, workspace_id: uuid.UUID) -> GraphResponse:
        nodes_dict = await self._fetch_all_nodes(workspace_id)
        relationships = await self.rel_repo.list_for_workspace(workspace_id)

        edges: List[GraphEdge] = []
        edges_by_relation: Dict[str, int] = {}
        nodes_by_type: Dict[str, int] = {}

        for n in nodes_dict.values():
            nodes_by_type[n.type] = nodes_by_type.get(n.type, 0) + 1

        for rel in relationships:
            s_id = str(rel.source_id)
            t_id = str(rel.target_id)
            # Only include edges whose endpoints exist in the active nodes
            if s_id in nodes_dict and t_id in nodes_dict:
                edges.append(
                    GraphEdge(
                        id=str(rel.id),
                        source=s_id,
                        source_type=rel.source_type,
                        target=t_id,
                        target_type=rel.target_type,
                        relation_type=rel.relation_type,
                        metadata=rel.metadata_json,
                        created_at=rel.created_at,
                    )
                )
                edges_by_relation[rel.relation_type] = edges_by_relation.get(rel.relation_type, 0) + 1

        total_nodes = len(nodes_dict)
        total_edges = len(edges)
        
        # Calculate graph density: 2 * E / (V * (V - 1))
        density = 0.0
        if total_nodes > 1:
            density = round((2.0 * total_edges) / (total_nodes * (total_nodes - 1)), 4)

        # Quick connected components / health calculation
        connected_node_ids = set()
        for e in edges:
            connected_node_ids.add(e.source)
            connected_node_ids.add(e.target)
        
        health_score = 100.0
        if total_nodes > 0:
            health_score = round((len(connected_node_ids) / total_nodes) * 100, 1)

        stats = GraphStats(
            total_nodes=total_nodes,
            total_edges=total_edges,
            nodes_by_type=nodes_by_type,
            edges_by_relation=edges_by_relation,
            density=density,
            health_score=health_score,
        )

        return GraphResponse(
            workspace_id=workspace_id,
            nodes=list(nodes_dict.values()),
            edges=edges,
            stats=stats,
        )

    async def trace_lineage(
        self,
        workspace_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID,
        direction: Literal["forward", "backward", "bidirectional"] = "bidirectional",
        max_depth: int = 10,
    ) -> LineageTrace:
        nodes_dict = await self._fetch_all_nodes(workspace_id)
        root_id = str(entity_id)

        if root_id not in nodes_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entity '{entity_type}' with ID '{entity_id}' not found in workspace.",
            )

        root_node = nodes_dict[root_id]
        relationships = await self.rel_repo.list_for_workspace(workspace_id)

        # Build adjacency structures
        outgoing: Dict[str, List[Tuple[str, GraphEdge]]] = {}
        incoming: Dict[str, List[Tuple[str, GraphEdge]]] = {}

        for rel in relationships:
            s_id = str(rel.source_id)
            t_id = str(rel.target_id)
            if s_id in nodes_dict and t_id in nodes_dict:
                edge = GraphEdge(
                    id=str(rel.id),
                    source=s_id,
                    source_type=rel.source_type,
                    target=t_id,
                    target_type=rel.target_type,
                    relation_type=rel.relation_type,
                    metadata=rel.metadata_json,
                    created_at=rel.created_at,
                )
                outgoing.setdefault(s_id, []).append((t_id, edge))
                incoming.setdefault(t_id, []).append((s_id, edge))

        traversed_node_ids: Set[str] = {root_id}
        traversed_edges: List[GraphEdge] = []
        visited_edge_ids: Set[str] = set()
        discovered_paths: List[List[str]] = []

        # Helper BFS/DFS for paths
        def traverse_forward(curr: str, path: List[str], depth: int):
            if depth >= max_depth:
                return
            for next_node, edge in outgoing.get(curr, []):
                if edge.id not in visited_edge_ids:
                    visited_edge_ids.add(edge.id)
                    traversed_edges.append(edge)
                traversed_node_ids.add(next_node)
                new_path = path + [next_node]
                discovered_paths.append(new_path)
                if next_node not in path:  # prevent cyclic infinite loops
                    traverse_forward(next_node, new_path, depth + 1)

        def traverse_backward(curr: str, path: List[str], depth: int):
            if depth >= max_depth:
                return
            for prev_node, edge in incoming.get(curr, []):
                if edge.id not in visited_edge_ids:
                    visited_edge_ids.add(edge.id)
                    traversed_edges.append(edge)
                traversed_node_ids.add(prev_node)
                new_path = [prev_node] + path
                discovered_paths.append(new_path)
                if prev_node not in path:  # prevent cyclic infinite loops
                    traverse_backward(prev_node, new_path, depth + 1)

        if direction in ["forward", "bidirectional"]:
            traverse_forward(root_id, [root_id], 0)

        if direction in ["backward", "bidirectional"]:
            traverse_backward(root_id, [root_id], 0)

        # Build lineage path models
        lineage_paths: List[LineagePath] = []
        for p in discovered_paths:
            node_codes = [nodes_dict[n_id].code for n_id in p if n_id in nodes_dict]
            descriptions = [f"{nodes_dict[n_id].code}: {nodes_dict[n_id].label[:40]}" for n_id in p if n_id in nodes_dict]
            
            # Find relations connecting path sequence
            rel_sequence = []
            for i in range(len(p) - 1):
                n1, n2 = p[i], p[i+1]
                edge_match = next((e.relation_type for e in traversed_edges if (e.source == n1 and e.target == n2) or (e.source == n2 and e.target == n1)), "relates")
                rel_sequence.append(edge_match)

            lineage_paths.append(
                LineagePath(
                    path_length=len(p),
                    node_ids=p,
                    node_codes=node_codes,
                    descriptions=descriptions,
                    relation_types=rel_sequence,
                )
            )

        # Sort paths by length descending
        lineage_paths.sort(key=lambda x: x.path_length, reverse=True)

        return LineageTrace(
            workspace_id=workspace_id,
            root_node=root_node,
            direction=direction,
            traversal_depth=max(len(p.node_ids) for p in lineage_paths) if lineage_paths else 1,
            nodes=[nodes_dict[n_id] for n_id in traversed_node_ids if n_id in nodes_dict],
            edges=traversed_edges,
            paths=lineage_paths[:20],  # Return top 20 most comprehensive paths
        )

    async def audit_orphans_and_disconnections(self, workspace_id: uuid.UUID) -> OrphanAuditReport:
        nodes_dict = await self._fetch_all_nodes(workspace_id)
        relationships = await self.rel_repo.list_for_workspace(workspace_id)

        # Map connections
        entity_outgoing: Dict[str, List[Relationship]] = {}
        entity_incoming: Dict[str, List[Relationship]] = {}

        for rel in relationships:
            s_id = str(rel.source_id)
            t_id = str(rel.target_id)
            entity_outgoing.setdefault(s_id, []).append(rel)
            entity_incoming.setdefault(t_id, []).append(rel)

        orphans: List[OrphanItem] = []
        summary_by_type: Dict[str, int] = {}

        for node_id, node in nodes_dict.items():
            u_id = uuid.UUID(node_id)
            out_rels = entity_outgoing.get(node_id, [])
            in_rels = entity_incoming.get(node_id, [])
            total_conns = len(out_rels) + len(in_rels)

            # Rule 1: Hypothesis must be tested by an Experiment or address a Gap/Question
            if node.type == "hypothesis":
                has_experiment = any(r.source_type == "experiment" or r.target_type == "experiment" for r in in_rels + out_rels)
                has_gap_or_question = any(r.target_type in ["gap", "question"] or r.source_type in ["gap", "question"] for r in out_rels + in_rels)
                
                if not has_experiment:
                    orphans.append(
                        OrphanItem(
                            id=u_id,
                            type=node.type,
                            code=node.code,
                            title=node.label,
                            reason="Hypothesis is unverified: no empirical experiments are linked to test it.",
                            severity="critical",
                            suggested_action="Design and link an experiment to empirically evaluate this hypothesis.",
                        )
                    )
                    summary_by_type[node.type] = summary_by_type.get(node.type, 0) + 1
                elif not has_gap_or_question:
                    orphans.append(
                        OrphanItem(
                            id=u_id,
                            type=node.type,
                            code=node.code,
                            title=node.label,
                            reason="Hypothesis lacks scientific grounding: no motivating research gap or question linked.",
                            severity="medium",
                            suggested_action="Link this hypothesis to the motivating research gap or research question.",
                        )
                    )
                    summary_by_type[node.type] = summary_by_type.get(node.type, 0) + 1

            # Rule 2: Research Gap must have an addressing Hypothesis
            elif node.type == "gap":
                has_hypothesis = any(r.source_type == "hypothesis" or r.target_type == "hypothesis" for r in in_rels + out_rels)
                if not has_hypothesis:
                    orphans.append(
                        OrphanItem(
                            id=u_id,
                            type=node.type,
                            code=node.code,
                            title=node.label,
                            reason="Research gap is unaddressed: no testable hypotheses have been proposed for it.",
                            severity="high",
                            suggested_action="Formulate a hypothesis proposing a solution to address this gap.",
                        )
                    )
                    summary_by_type[node.type] = summary_by_type.get(node.type, 0) + 1

            # Rule 3: Experiment completed without Results or lacking Hypothesis
            elif node.type == "experiment":
                has_hypothesis = any(r.target_type == "hypothesis" or r.source_type == "hypothesis" for r in out_rels + in_rels)
                has_results = any(r.source_type == "result" or r.target_type == "result" for r in in_rels + out_rels)

                if not has_hypothesis:
                    orphans.append(
                        OrphanItem(
                            id=u_id,
                            type=node.type,
                            code=node.code,
                            title=node.label,
                            reason="Experiment lacks scientific intent: no targeted hypothesis is linked.",
                            severity="high",
                            suggested_action="Link this experiment to the specific hypothesis it was designed to test.",
                        )
                    )
                    summary_by_type[node.type] = summary_by_type.get(node.type, 0) + 1
                elif node.status == "completed" and not has_results:
                    orphans.append(
                        OrphanItem(
                            id=u_id,
                            type=node.type,
                            code=node.code,
                            title=node.label,
                            reason="Experiment is marked completed but has no empirical result artifacts or metrics logged.",
                            severity="high",
                            suggested_action="Log empirical results, metric summaries, or evaluation artifacts for this run.",
                        )
                    )
                    summary_by_type[node.type] = summary_by_type.get(node.type, 0) + 1

            # Rule 4: Claim must be supported by Results or Literature
            elif node.type == "claim":
                has_support = any(r.source_type in ["result", "paper"] or r.relation_type in ["supports", "cites"] for r in in_rels + out_rels)
                if not has_support:
                    orphans.append(
                        OrphanItem(
                            id=u_id,
                            type=node.type,
                            code=node.code,
                            title=node.label,
                            reason="Scientific claim is unsubstantiated: no supporting empirical results or cited papers.",
                            severity="high",
                            suggested_action="Attach supporting experimental results or literature citations to substantiate this claim.",
                        )
                    )
                    summary_by_type[node.type] = summary_by_type.get(node.type, 0) + 1

            # Rule 5: Generic disconnected check for Questions and Decisions
            elif total_conns == 0:
                orphans.append(
                    OrphanItem(
                        id=u_id,
                        type=node.type,
                        code=node.code,
                        title=node.label,
                        reason=f"Disconnected {node.type}: no relationships connect this item to the reasoning graph.",
                        severity="medium" if node.type in ["question", "decision"] else "low",
                        suggested_action=f"Link this {node.type} to related literature, hypotheses, or decisions.",
                    )
                )
                summary_by_type[node.type] = summary_by_type.get(node.type, 0) + 1

        total_entities = len(nodes_dict)
        total_orphans = len(orphans)
        connected_entities = total_entities - total_orphans
        health_score = 100.0
        if total_entities > 0:
            health_score = max(0.0, round((connected_entities / total_entities) * 100.0, 1))

        return OrphanAuditReport(
            workspace_id=workspace_id,
            total_entities=total_entities,
            total_orphans=total_orphans,
            connected_entities=max(0, connected_entities),
            health_score=health_score,
            orphans=orphans,
            summary_by_type=summary_by_type,
            generated_at=datetime.now(timezone.utc),
        )

    async def create_relationship(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        rel_in: RelationshipCreate,
    ) -> RelationshipRead:
        nodes_dict = await self._fetch_all_nodes(workspace_id)
        s_id = str(rel_in.source_id)
        t_id = str(rel_in.target_id)

        if s_id not in nodes_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source entity ({rel_in.source_type} {rel_in.source_id}) not found in workspace.",
            )

        if t_id not in nodes_dict:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target entity ({rel_in.target_type} {rel_in.target_id}) not found in workspace.",
            )

        # 1. Semantic ontology validation
        allowed_pairs = {
            ("paper", "informs", "question"),
            ("paper", "motivates", "question"),
            ("paper", "informs", "gap"),
            ("paper", "motivates", "gap"),
            ("paper", "informs", "hypothesis"),
            ("paper", "cites", "paper"),
            ("paper", "cites", "claim"),
            ("paper", "supports", "claim"),
            ("paper", "refutes", "claim"),
            ("question", "motivates", "gap"),
            ("question", "motivates", "hypothesis"),
            ("gap", "motivates", "hypothesis"),
            ("gap", "addresses", "hypothesis"),
            ("hypothesis", "tests", "experiment"),
            ("hypothesis", "addresses", "gap"),
            ("hypothesis", "motivates", "experiment"),
            ("experiment", "produces", "result"),
            ("experiment", "supports", "result"),
            ("result", "supports", "hypothesis"),
            ("result", "refutes", "hypothesis"),
            ("result", "validates", "hypothesis"),
            ("result", "supports", "decision"),
            ("result", "informs", "decision"),
            ("result", "refutes", "decision"),
            ("result", "supports", "claim"),
            ("result", "refutes", "claim"),
            ("result", "validates", "claim"),
            ("decision", "supports", "claim"),
            ("decision", "derived_from", "claim"),
            ("decision", "addresses", "hypothesis"),
            ("decision", "validates", "hypothesis"),
            ("decision", "supersedes", "decision"),
            ("claim", "derived_from", "decision"),
            ("claim", "supports", "claim"),
        }

        pair = (rel_in.source_type, rel_in.relation_type, rel_in.target_type)
        if pair not in allowed_pairs:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Semantic relation '{rel_in.relation_type}' is not allowed from '{rel_in.source_type}' to '{rel_in.target_type}'.",
            )

        # 2. Check for existing duplicate edge
        exists = await self.rel_repo.exists(
            workspace_id=workspace_id,
            source_type=rel_in.source_type,
            source_id=rel_in.source_id,
            target_type=rel_in.target_type,
            target_id=rel_in.target_id,
            relation_type=rel_in.relation_type,
        )
        if exists:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Relationship already exists between these entities.",
            )

        # 3. DAG cycle prevention (traverse downstream from target to ensure source is unreachable)
        existing_rels = await self.rel_repo.list_for_workspace(workspace_id)
        visited = set()
        queue = [t_id]
        while queue:
            curr = queue.pop(0)
            if curr == s_id:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Adding this relationship would create a directed cycle in the reasoning graph.",
                )
            if curr not in visited:
                visited.add(curr)
                for r in existing_rels:
                    if str(r.source_id) == curr and str(r.target_id) not in visited:
                        queue.append(str(r.target_id))

        rel = Relationship(
            workspace_id=workspace_id,
            source_type=rel_in.source_type,
            source_id=rel_in.source_id,
            target_type=rel_in.target_type,
            target_id=rel_in.target_id,
            relation_type=rel_in.relation_type,
            metadata_json=rel_in.metadata,
            created_by=user_id,
        )
        created = await self.rel_repo.create(rel)
        return RelationshipRead.model_validate(created)

    async def delete_relationship(self, workspace_id: uuid.UUID, rel_id: uuid.UUID) -> None:
        deleted = await self.rel_repo.delete(rel_id, workspace_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Relationship not found in workspace.",
            )
