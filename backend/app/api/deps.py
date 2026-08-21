import re
import uuid
from typing import Annotated
from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import (
    bearer_scheme,
    get_current_user,
    get_current_active_user,
)
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership
from app.repositories.workspace_repository import WorkspaceRepository


async def get_current_workspace_context(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    x_workspace_id: Annotated[str | None, Header(alias="X-Workspace-Id")] = None,
) -> tuple[uuid.UUID, WorkspaceMembership]:
    """
    Enforces multi-tenant isolation:
    Extracts active workspace ID from X-Workspace-Id header,
    or smoothly resolves the user's active workspace (auto-creating a default if none exists),
    and strictly validates that current_user has an active membership.
    """
    ws_repo = WorkspaceRepository(db)

    if x_workspace_id:
        try:
            workspace_id = uuid.UUID(x_workspace_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid UUID format in 'X-Workspace-Id' header.",
            )

        membership = await ws_repo.get_membership(workspace_id, current_user.id)
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have access to this workspace.",
            )
        return workspace_id, membership

    # When X-Workspace-Id is not supplied in header, check for user's existing workspaces
    user_workspaces = await ws_repo.list_for_user(current_user.id)
    if user_workspaces:
        first_ws, _ = user_workspaces[0]
        membership = await ws_repo.get_membership(first_ws.id, current_user.id)
        if membership:
            return first_ws.id, membership

    # Auto-provision a default personal workspace for the user
    user_prefix = current_user.full_name or "Personal"
    clean_slug = re.sub(r"[^a-z0-9]+", "-", f"{user_prefix}-lab".lower()).strip("-")
    slug = f"{clean_slug}-{current_user.id.hex[:6]}"

    default_ws = Workspace(
        name=f"{user_prefix}'s Research Lab",
        slug=slug,
        description="Default research workspace",
        owner_id=current_user.id,
    )
    created_ws = await ws_repo.create(default_ws)

    membership = WorkspaceMembership(
        workspace_id=created_ws.id,
        user_id=current_user.id,
        role="owner",
    )
    created_membership = await ws_repo.add_member(membership)
    return created_ws.id, created_membership
