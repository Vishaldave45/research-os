import re
import uuid
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.workspace import Workspace, WorkspaceMembership
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceRead,
    WorkspaceDetail,
    WorkspaceMemberRead,
    WorkspaceMemberInvite,
)
from app.repositories.workspace_repository import WorkspaceRepository
from app.repositories.user_repository import UserRepository


def generate_slug(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    slug = re.sub(r"^-+|-+$", "", slug)
    return slug or f"workspace-{uuid.uuid4().hex[:6]}"


class WorkspaceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.workspace_repo = WorkspaceRepository(db)
        self.user_repo = UserRepository(db)

    async def create_workspace(self, workspace_in: WorkspaceCreate, creator: User) -> WorkspaceRead:
        base_slug = workspace_in.slug or generate_slug(workspace_in.name)
        slug = base_slug
        counter = 1
        
        # Ensure unique slug
        while await self.workspace_repo.get_by_slug(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Create workspace entity
        workspace = Workspace(
            name=workspace_in.name.strip(),
            slug=slug,
            description=workspace_in.description.strip() if workspace_in.description else None,
            owner_id=creator.id,
        )
        created_workspace = await self.workspace_repo.create(workspace)

        # Create owner membership automatically
        membership = WorkspaceMembership(
            workspace_id=created_workspace.id,
            user_id=creator.id,
            role="owner",
        )
        await self.workspace_repo.add_member(membership)

        resp = WorkspaceRead.model_validate(created_workspace)
        resp.current_user_role = "owner"
        return resp

    async def list_user_workspaces(self, user_id: uuid.UUID) -> List[WorkspaceRead]:
        rows = await self.workspace_repo.list_for_user(user_id)
        result: List[WorkspaceRead] = []
        for ws, role in rows:
            item = WorkspaceRead.model_validate(ws)
            item.current_user_role = role
            result.append(item)
        return result

    async def get_workspace_detail(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> WorkspaceDetail:
        membership = await self.workspace_repo.get_membership(workspace_id, user_id)
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You are not a member of this workspace.",
            )

        workspace = await self.workspace_repo.get_by_id(workspace_id)
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found.",
            )

        members_raw = await self.workspace_repo.list_members(workspace_id)
        member_reads: List[WorkspaceMemberRead] = []
        for mem, u in members_raw:
            member_reads.append(
                WorkspaceMemberRead(
                    id=mem.id,
                    workspace_id=mem.workspace_id,
                    user_id=mem.user_id,
                    role=mem.role,
                    user_email=u.email,
                    user_full_name=u.full_name,
                    created_at=mem.created_at,
                )
            )

        detail = WorkspaceDetail.model_validate(workspace)
        detail.current_user_role = membership.role
        detail.members = member_reads
        return detail

    async def invite_member(
        self,
        workspace_id: uuid.UUID,
        invite: WorkspaceMemberInvite,
        acting_user: User,
    ) -> WorkspaceMemberRead:
        acting_membership = await self.workspace_repo.get_membership(workspace_id, acting_user.id)
        if not acting_membership or acting_membership.role not in ["owner", "researcher"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied: Only workspace owners and researchers can add members.",
            )

        target_user = await self.user_repo.get_by_email(invite.email)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email '{invite.email}' not found.",
            )

        existing_membership = await self.workspace_repo.get_membership(workspace_id, target_user.id)
        if existing_membership:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already a member of this workspace.",
            )

        membership = WorkspaceMembership(
            workspace_id=workspace_id,
            user_id=target_user.id,
            role=invite.role,
        )
        created_membership = await self.workspace_repo.add_member(membership)

        return WorkspaceMemberRead(
            id=created_membership.id,
            workspace_id=created_membership.workspace_id,
            user_id=created_membership.user_id,
            role=created_membership.role,
            user_email=target_user.email,
            user_full_name=target_user.full_name,
            created_at=created_membership.created_at,
        )
