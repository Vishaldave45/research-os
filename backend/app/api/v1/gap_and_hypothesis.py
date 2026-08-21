import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.gap_and_hypothesis import (
    GapCreate,
    GapRead,
    HypothesisCreate,
    HypothesisRead,
)
from app.services.gap_and_hypothesis_service import (
    GapService,
    HypothesisService,
)
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership

gaps_router = APIRouter(prefix="/gaps", tags=["Research Gaps"])
hypotheses_router = APIRouter(prefix="/hypotheses", tags=["Hypotheses"])


# --- Research Gaps ---
@gaps_router.get("", response_model=List[GapRead], status_code=status.HTTP_200_OK)
async def list_gaps(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: Optional[str] = Query(None, alias="status"),
    impact_level: Optional[str] = Query(None, alias="impact_level"),
    search: Optional[str] = Query(None),
):
    """List research gaps in the active workspace with optional filters."""
    workspace_id, _ = ws_ctx
    service = GapService(db)
    return await service.list_gaps(
        workspace_id,
        status_filter=status_filter,
        impact_level=impact_level,
        search=search,
    )


@gaps_router.post("", response_model=GapRead, status_code=status.HTTP_201_CREATED)
async def create_gap(
    gap_in: GapCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a research gap and establish traceability links to questions and papers."""
    workspace_id, _ = ws_ctx
    service = GapService(db)
    return await service.create_gap(gap_in, workspace_id, current_user.id)


@gaps_router.get("/{gap_id}", response_model=GapRead, status_code=status.HTTP_200_OK)
async def get_gap(
    gap_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get single gap details."""
    workspace_id, _ = ws_ctx
    service = GapService(db)
    return await service.get_gap(gap_id, workspace_id)


# --- Hypotheses ---
@hypotheses_router.get("", response_model=List[HypothesisRead], status_code=status.HTTP_200_OK)
async def list_hypotheses(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
):
    """List hypotheses in the active workspace."""
    workspace_id, _ = ws_ctx
    service = HypothesisService(db)
    return await service.list_hypotheses(workspace_id, status_filter=status_filter, search=search)


@hypotheses_router.post("", response_model=HypothesisRead, status_code=status.HTTP_201_CREATED)
async def create_hypothesis(
    hypothesis_in: HypothesisCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a hypothesis and establish traceability links to addressed gaps and questions."""
    workspace_id, _ = ws_ctx
    service = HypothesisService(db)
    return await service.create_hypothesis(hypothesis_in, workspace_id, current_user.id)


@hypotheses_router.get("/{hypothesis_id}", response_model=HypothesisRead, status_code=status.HTTP_200_OK)
async def get_hypothesis(
    hypothesis_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get single hypothesis details."""
    workspace_id, _ = ws_ctx
    service = HypothesisService(db)
    return await service.get_hypothesis(hypothesis_id, workspace_id)
