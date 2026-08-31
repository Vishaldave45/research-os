import re
import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.domain import ResearchDomain
from app.repositories.domain_repository import DomainRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.domain import DomainCreate, DomainUpdate, DomainRead


class DomainService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DomainRepository(db)
        self.ws_repo = WorkspaceRepository(db)

    async def list_domains(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> List[DomainRead]:
        membership = await self.ws_repo.get_membership(workspace_id, user_id)
        if not membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace.")
        
        domain_tuples = await self.repo.list_by_workspace(workspace_id)
        out = []
        for d, count in domain_tuples:
            read_obj = DomainRead(
                id=d.id,
                workspace_id=d.workspace_id,
                name=d.name,
                slug=d.slug,
                description=d.description,
                color_badge=d.color_badge,
                icon=d.icon,
                metadata_json=d.metadata_json or {},
                created_by=d.created_by,
                created_at=d.created_at,
                updated_at=d.updated_at,
                project_count=count,
            )
            out.append(read_obj)
        return out

    async def create_domain(self, workspace_id: uuid.UUID, user_id: uuid.UUID, domain_in: DomainCreate) -> DomainRead:
        membership = await self.ws_repo.get_membership(workspace_id, user_id)
        if not membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace.")
        
        clean_slug = re.sub(r"[^a-z0-9]+", "-", domain_in.name.lower()).strip("-")
        slug = f"{clean_slug}-{uuid.uuid4().hex[:4]}"

        domain = ResearchDomain(
            workspace_id=workspace_id,
            name=domain_in.name,
            slug=slug,
            description=domain_in.description,
            color_badge=domain_in.color_badge,
            icon=domain_in.icon,
            metadata_json=domain_in.metadata_json,
            created_by=user_id,
        )
        created = await self.repo.create(domain)
        return DomainRead(
            id=created.id,
            workspace_id=created.workspace_id,
            name=created.name,
            slug=created.slug,
            description=created.description,
            color_badge=created.color_badge,
            icon=created.icon,
            metadata_json=created.metadata_json or {},
            created_by=created.created_by,
            created_at=created.created_at,
            updated_at=created.updated_at,
            project_count=0,
        )

    async def get_domain(self, domain_id: uuid.UUID, user_id: uuid.UUID) -> DomainRead:
        domain = await self.repo.get_by_id(domain_id)
        if not domain:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research domain not found.")
        
        membership = await self.ws_repo.get_membership(domain.workspace_id, user_id)
        if not membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace.")
        
        return DomainRead(
            id=domain.id,
            workspace_id=domain.workspace_id,
            name=domain.name,
            slug=domain.slug,
            description=domain.description,
            color_badge=domain.color_badge,
            icon=domain.icon,
            metadata_json=domain.metadata_json or {},
            created_by=domain.created_by,
            created_at=domain.created_at,
            updated_at=domain.updated_at,
            project_count=len(domain.projects) if domain.projects else 0,
        )

    async def update_domain(self, domain_id: uuid.UUID, user_id: uuid.UUID, update_in: DomainUpdate) -> DomainRead:
        domain = await self.repo.get_by_id(domain_id)
        if not domain:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research domain not found.")
        
        membership = await self.ws_repo.get_membership(domain.workspace_id, user_id)
        if not membership:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace.")

        if update_in.name is not None:
            domain.name = update_in.name
        if update_in.description is not None:
            domain.description = update_in.description
        if update_in.color_badge is not None:
            domain.color_badge = update_in.color_badge
        if update_in.icon is not None:
            domain.icon = update_in.icon
        if update_in.metadata_json is not None:
            domain.metadata_json = update_in.metadata_json

        updated = await self.repo.update(domain)
        return DomainRead(
            id=updated.id,
            workspace_id=updated.workspace_id,
            name=updated.name,
            slug=updated.slug,
            description=updated.description,
            color_badge=updated.color_badge,
            icon=updated.icon,
            metadata_json=updated.metadata_json or {},
            created_by=updated.created_by,
            created_at=updated.created_at,
            updated_at=updated.updated_at,
            project_count=len(updated.projects) if updated.projects else 0,
        )

    async def delete_domain(self, domain_id: uuid.UUID, user_id: uuid.UUID) -> None:
        domain = await self.repo.get_by_id(domain_id)
        if not domain:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research domain not found.")
        
        membership = await self.ws_repo.get_membership(domain.workspace_id, user_id)
        if not membership or membership.role not in ["owner", "admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only workspace owners or admins can delete research domains.")
        
        await self.repo.delete(domain)
