import uuid
from typing import Annotated, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceRead,
    WorkspaceDetail,
    WorkspaceMemberInvite,
    WorkspaceMemberRead,
)
from app.services.workspace_service import WorkspaceService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.get("", response_model=List[WorkspaceRead], status_code=status.HTTP_200_OK)
async def list_workspaces(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List all workspaces that the authenticated user belongs to."""
    service = WorkspaceService(db)
    return await service.list_user_workspaces(current_user.id)


@router.post("", response_model=WorkspaceRead, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_in: WorkspaceCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new research workspace with current user as owner."""
    service = WorkspaceService(db)
    return await service.create_workspace(workspace_in, current_user)


@router.get("/{workspace_id}", response_model=WorkspaceDetail, status_code=status.HTTP_200_OK)
async def get_workspace(
    workspace_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get workspace details including active members list."""
    service = WorkspaceService(db)
    return await service.get_workspace_detail(workspace_id, current_user.id)


@router.post("/{workspace_id}/members", response_model=WorkspaceMemberRead, status_code=status.HTTP_201_CREATED)
async def invite_member(
    workspace_id: uuid.UUID,
    invite: WorkspaceMemberInvite,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Invite a registered user to join the workspace with a designated role."""
    service = WorkspaceService(db)
    return await service.invite_member(workspace_id, invite, current_user)
