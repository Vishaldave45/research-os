import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.experiment_and_result import (
    ExperimentCreate,
    ExperimentRead,
    ResultCreate,
    ResultRead,
)
from app.schemas.claim import (
    ClaimCreate,
    ClaimRead,
)
from app.services.experiment_and_claim_service import (
    ExperimentService,
    ResultService,
    ClaimService,
)
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership

experiments_router = APIRouter(prefix="/experiments", tags=["Experiments"])
results_router = APIRouter(prefix="/results", tags=["Results"])
claims_router = APIRouter(prefix="/claims", tags=["Claims"])


# --- Experiments ---
@experiments_router.get("", response_model=List[ExperimentRead], status_code=status.HTTP_200_OK)
async def list_experiments(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
):
    """List experiments in the active workspace."""
    workspace_id, _ = ws_ctx
    service = ExperimentService(db)
    return await service.list_experiments(workspace_id, status_filter=status_filter, search=search)


@experiments_router.post("", response_model=ExperimentRead, status_code=status.HTTP_201_CREATED)
async def create_experiment(
    experiment_in: ExperimentCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new experiment execution record and link to hypotheses."""
    workspace_id, _ = ws_ctx
    service = ExperimentService(db)
    return await service.create_experiment(experiment_in, workspace_id, current_user.id)


@experiments_router.get("/{experiment_id}", response_model=ExperimentRead, status_code=status.HTTP_200_OK)
async def get_experiment(
    experiment_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get single experiment details."""
    workspace_id, _ = ws_ctx
    service = ExperimentService(db)
    return await service.get_experiment(experiment_id, workspace_id)


# --- Results ---
@results_router.get("", response_model=List[ResultRead], status_code=status.HTTP_200_OK)
async def list_results(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    experiment_id: Optional[uuid.UUID] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
):
    """List results in the active workspace."""
    workspace_id, _ = ws_ctx
    service = ResultService(db)
    return await service.list_results(
        workspace_id,
        experiment_id=experiment_id,
        status_filter=status_filter,
        search=search,
    )


@results_router.post("", response_model=ResultRead, status_code=status.HTTP_201_CREATED)
async def create_result(
    result_in: ResultCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Log an empirical result with metrics and artifacts, linking it to supported/refuted hypotheses."""
    workspace_id, _ = ws_ctx
    service = ResultService(db)
    return await service.create_result(result_in, workspace_id, current_user.id)


@results_router.get("/{result_id}", response_model=ResultRead, status_code=status.HTTP_200_OK)
async def get_result(
    result_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get single result details."""
    workspace_id, _ = ws_ctx
    service = ResultService(db)
    return await service.get_result(result_id, workspace_id)


# --- Claims ---
@claims_router.get("", response_model=List[ClaimRead], status_code=status.HTTP_200_OK)
async def list_claims(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
):
    """List claims in the active workspace."""
    workspace_id, _ = ws_ctx
    service = ClaimService(db)
    return await service.list_claims(workspace_id, status_filter=status_filter, search=search)


@claims_router.post("", response_model=ClaimRead, status_code=status.HTTP_201_CREATED)
async def create_claim(
    claim_in: ClaimCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Assert a scientific claim, establishing formal links to supporting results, hypotheses, and papers."""
    workspace_id, _ = ws_ctx
    service = ClaimService(db)
    return await service.create_claim(claim_in, workspace_id, current_user.id)


@claims_router.get("/{claim_id}", response_model=ClaimRead, status_code=status.HTTP_200_OK)
async def get_claim(
    claim_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get single claim details."""
    workspace_id, _ = ws_ctx
    service = ClaimService(db)
    return await service.get_claim(claim_id, workspace_id)
