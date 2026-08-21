import uuid
from typing import Annotated, Literal, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.graph import (
    GraphResponse,
    GraphStats,
    LineageTrace,
    OrphanAuditReport,
)
from app.services.graph_service import GraphService
from app.api.deps import get_current_workspace_context
from app.models.workspace import WorkspaceMembership

router = APIRouter(prefix="/graph", tags=["Knowledge & Traceability Graph"])


@router.get("", response_model=GraphResponse, status_code=status.HTTP_200_OK)
async def get_reasoning_graph(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Retrieve the full interactive reasoning and traceability graph for the active workspace.
    Returns all entity nodes, polymorphic directed reasoning edges, and topological statistics.
    """
    workspace_id, _ = ws_ctx
    service = GraphService(db)
    return await service.get_full_graph(workspace_id)


@router.get("/stats", response_model=GraphStats, status_code=status.HTTP_200_OK)
async def get_graph_stats(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get summary density, node distribution, and reasoning connectivity health metrics for the workspace graph.
    """
    workspace_id, _ = ws_ctx
    service = GraphService(db)
    graph_data = await service.get_full_graph(workspace_id)
    return graph_data.stats


@router.get("/lineage/{entity_type}/{entity_id}", response_model=LineageTrace, status_code=status.HTTP_200_OK)
async def trace_entity_lineage(
    entity_type: str,
    entity_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    direction: Literal["forward", "backward", "bidirectional"] = Query(
        "bidirectional",
        description="Lineage direction: 'backward' for upstream grounding/provenance, 'forward' for downstream impacts/claims, 'bidirectional' for full reasoning subtree.",
    ),
    max_depth: int = Query(10, ge=1, le=25, description="Maximum traversal depth"),
):
    """
    Compute multi-hop forward or backward evidence lineage paths for any research entity.
    Returns subgraphs and full sequence paths connecting Question -> Paper/Gap -> Hypothesis -> Experiment -> Result -> Decision/Claim.
    """
    workspace_id, _ = ws_ctx
    service = GraphService(db)
    return await service.trace_lineage(
        workspace_id=workspace_id,
        entity_type=entity_type,
        entity_id=entity_id,
        direction=direction,
        max_depth=max_depth,
    )


@router.get("/orphans", response_model=OrphanAuditReport, status_code=status.HTTP_200_OK)
async def audit_orphans_and_disconnections(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Audit disconnected or ungrounded research artifacts across the workspace.
    Identifies untested hypotheses, unaddressed research gaps, experiments missing result metrics, and unsubstantiated claims.
    """
    workspace_id, _ = ws_ctx
    service = GraphService(db)
    return await service.audit_orphans_and_disconnections(workspace_id)
