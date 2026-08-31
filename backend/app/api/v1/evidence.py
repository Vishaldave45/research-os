import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.schemas.evidence import EvidenceCreate, EvidenceUpdate, EvidenceRead
from app.services.evidence_service import EvidenceService

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.get("", response_model=List[EvidenceRead], status_code=status.HTTP_200_OK)
async def list_evidence(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    evidence_type: Optional[str] = Query(None),
    strength: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    workspace_id, _ = ws_ctx
    service = EvidenceService(db)
    return await service.list_evidence(
        workspace_id=workspace_id,
        evidence_type=evidence_type,
        strength=strength,
        search=search,
    )


@router.post("", response_model=EvidenceRead, status_code=status.HTTP_201_CREATED)
async def create_evidence(
    evidence_in: EvidenceCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = EvidenceService(db)
    return await service.create_evidence(workspace_id, current_user.id, evidence_in)


@router.get("/{evidence_id}", response_model=EvidenceRead, status_code=status.HTTP_200_OK)
async def get_evidence(
    evidence_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = EvidenceService(db)
    return await service.get_evidence(evidence_id, workspace_id)


@router.put("/{evidence_id}", response_model=EvidenceRead, status_code=status.HTTP_200_OK)
async def update_evidence(
    evidence_id: uuid.UUID,
    evidence_in: EvidenceUpdate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = EvidenceService(db)
    return await service.update_evidence(evidence_id, workspace_id, evidence_in)


@router.delete("/{evidence_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evidence(
    evidence_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = EvidenceService(db)
    await service.delete_evidence(evidence_id, workspace_id)
