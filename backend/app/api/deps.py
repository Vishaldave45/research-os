import uuid
from typing import Annotated
from fastapi import Depends, HTTPException, Header, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import (
    bearer_scheme,
    get_current_user,
    get_current_active_user,
)
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.repositories.user_repository import UserRepository
from app.repositories.workspace_repository import WorkspaceRepository


async def get_current_workspace_context(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    x_workspace_id: Annotated[str | None, Header(alias="X-Workspace-Id")] = None,
) -> tuple[uuid.UUID, WorkspaceMembership]:
    """
    Enforces multi-tenant isolation:
    Extracts active workspace ID from X-Workspace-Id header,
    and strictly validates that current_user has an active membership.
    """
    if not x_workspace_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required 'X-Workspace-Id' header.",
        )

    try:
        workspace_id = uuid.UUID(x_workspace_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format in 'X-Workspace-Id' header.",
        )

    ws_repo = WorkspaceRepository(db)
    membership = await ws_repo.get_membership(workspace_id, current_user.id)
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have access to this workspace.",
        )

    return workspace_id, membership

