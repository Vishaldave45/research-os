import uuid
from typing import Optional, List, Tuple
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.workspace import Workspace, WorkspaceMembership
from app.models.user import User


class WorkspaceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, workspace_id: uuid.UUID) -> Optional[Workspace]:
        stmt = select(Workspace).where(Workspace.id == workspace_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Workspace]:
        stmt = select(Workspace).where(Workspace.slug == slug.lower().strip())
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, workspace: Workspace) -> Workspace:
        self.db.add(workspace)
        await self.db.flush()
        await self.db.refresh(workspace)
        return workspace

    async def list_for_user(self, user_id: uuid.UUID) -> List[Tuple[Workspace, str]]:
        """Return all workspaces user belongs to along with their specific role."""
        stmt = (
            select(Workspace, WorkspaceMembership.role)
            .join(WorkspaceMembership, Workspace.id == WorkspaceMembership.workspace_id)
            .where(WorkspaceMembership.user_id == user_id)
            .order_by(Workspace.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.all())

    async def get_membership(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Optional[WorkspaceMembership]:
        stmt = select(WorkspaceMembership).where(
            and_(
                WorkspaceMembership.workspace_id == workspace_id,
                WorkspaceMembership.user_id == user_id,
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def add_member(self, membership: WorkspaceMembership) -> WorkspaceMembership:
        self.db.add(membership)
        await self.db.flush()
        await self.db.refresh(membership)
        return membership

    async def list_members(self, workspace_id: uuid.UUID) -> List[Tuple[WorkspaceMembership, User]]:
        stmt = (
            select(WorkspaceMembership, User)
            .join(User, WorkspaceMembership.user_id == User.id)
            .where(WorkspaceMembership.workspace_id == workspace_id)
            .order_by(WorkspaceMembership.created_at.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.all())

    async def remove_member(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        membership = await self.get_membership(workspace_id, user_id)
        if membership:
            await self.db.delete(membership)
            return True
        return False
