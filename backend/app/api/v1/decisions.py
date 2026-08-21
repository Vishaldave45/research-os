import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.decision import DecisionCreate, DecisionRead
from app.services.decision_service import DecisionService
from app.services.graph_service import GraphService
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership

router = APIRouter(prefix="/decisions", tags=["Decisions"])


@router.get("", response_model=List[DecisionRead], status_code=status.HTTP_200_OK)
async def list_decisions(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    outcome: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """List architecture or research decisions in the active workspace."""
    workspace_id, _ = ws_ctx
    service = DecisionService(db)
    return await service.list_decisions(workspace_id, outcome_filter=outcome, search=search)


@router.post("", response_model=DecisionRead, status_code=status.HTTP_201_CREATED)
async def create_decision(
    decision_in: DecisionCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Record an empirical research decision with supporting results and addressed hypotheses."""
    workspace_id, _ = ws_ctx
    service = DecisionService(db)
    return await service.create_decision(decision_in, workspace_id, current_user.id)


@router.get("/{decision_id}", response_model=DecisionRead, status_code=status.HTTP_200_OK)
async def get_decision(
    decision_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get single decision details."""
    workspace_id, _ = ws_ctx
    service = DecisionService(db)
    return await service.get_decision(decision_id, workspace_id)


@router.get("/{decision_id}/trace", status_code=status.HTTP_200_OK)
async def get_decision_trace(
    decision_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Retrieve backwards deterministic provenance trace from the decision to motivating literature."""
    workspace_id, _ = ws_ctx
    graph_service = GraphService(db)
    return await graph_service.trace_lineage(
        workspace_id=workspace_id,
        entity_type="decision",
        entity_id=decision_id,
        direction="backward",
    )

