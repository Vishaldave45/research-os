import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.graph import (
    RelationshipCreate,
    RelationshipRead,
    RelationshipBatchCreate,
)
from app.services.graph_service import GraphService
from app.repositories.relationship_repository import RelationshipRepository
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership

router = APIRouter(prefix="/relationships", tags=["Reasoning Relationships"])


@router.get("", response_model=List[RelationshipRead], status_code=status.HTTP_200_OK)
async def list_relationships(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    relation_type: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
):
    """List all directed reasoning relationships in the active workspace."""
    workspace_id, _ = ws_ctx
    repo = RelationshipRepository(db)
    items = await repo.list_for_workspace(
        workspace_id=workspace_id,
        relation_type=relation_type,
        entity_type=entity_type,
    )
    return [RelationshipRead.model_validate(item) for item in items]


@router.post("", response_model=RelationshipRead, status_code=status.HTTP_201_CREATED)
async def create_relationship(
    rel_in: RelationshipCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Establish a typed directed reasoning link between any two research entities in the workspace
    (e.g., hypothesis tests gap, experiment tests hypothesis, result supports claim).
    """
    workspace_id, _ = ws_ctx
    service = GraphService(db)
    return await service.create_relationship(workspace_id, current_user.id, rel_in)


@router.post("/batch", response_model=List[RelationshipRead], status_code=status.HTTP_201_CREATED)
async def create_batch_relationships(
    batch_in: RelationshipBatchCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Batch create multiple reasoning links."""
    workspace_id, _ = ws_ctx
    service = GraphService(db)
    created_list = []
    for rel_in in batch_in.relationships:
        try:
            rel = await service.create_relationship(workspace_id, current_user.id, rel_in)
            created_list.append(rel)
        except Exception:
            # Continue on duplicates
            pass
    return created_list


@router.delete("/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_relationship(
    relationship_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete a reasoning relationship link."""
    workspace_id, _ = ws_ctx
    service = GraphService(db)
    await service.delete_relationship(workspace_id, relationship_id)
    return None
