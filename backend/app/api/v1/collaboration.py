import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.schemas.collaboration import (
    CommentCreate,
    CommentRead,
    ReviewCreate,
    ReviewRead,
    AuditLogRead,
)
from app.services.collaboration_service import CollaborationService

router = APIRouter(prefix="/collaboration", tags=["CollaborationOS"])


# --- Comments ---
@router.get("/comments", response_model=List[CommentRead], status_code=status.HTTP_200_OK)
async def list_comments(
    entity_type: str = Query(..., description="Target entity type"),
    entity_id: uuid.UUID = Query(..., description="Target entity ID"),
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    workspace_id, _ = ws_ctx
    service = CollaborationService(db)
    return await service.list_comments(
        workspace_id=workspace_id,
        entity_type=entity_type,
        entity_id=entity_id,
    )


@router.post("/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_in: CommentCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = CollaborationService(db)
    return await service.create_comment(
        workspace_id=workspace_id,
        author_id=current_user.id,
        data=comment_in,
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = CollaborationService(db)
    await service.delete_comment(
        comment_id=comment_id,
        workspace_id=workspace_id,
        user_id=current_user.id,
    )


# --- Reviews ---
@router.get("/reviews", response_model=List[ReviewRead], status_code=status.HTTP_200_OK)
async def list_reviews(
    entity_type: str = Query(..., description="Target entity type"),
    entity_id: uuid.UUID = Query(..., description="Target entity ID"),
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    workspace_id, _ = ws_ctx
    service = CollaborationService(db)
    return await service.list_reviews(
        workspace_id=workspace_id,
        entity_type=entity_type,
        entity_id=entity_id,
    )


@router.post("/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_in: ReviewCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = CollaborationService(db)
    return await service.create_review(
        workspace_id=workspace_id,
        reviewer_id=current_user.id,
        data=review_in,
    )


# --- Audit Logs ---
@router.get("/audit-logs", response_model=List[AuditLogRead], status_code=status.HTTP_200_OK)
async def list_audit_logs(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    entity_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
):
    workspace_id, _ = ws_ctx
    service = CollaborationService(db)
    return await service.list_audit_logs(
        workspace_id=workspace_id,
        entity_type=entity_type,
        limit=limit,
    )
