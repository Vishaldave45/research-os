import uuid
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.domain import ResearchDomain
from app.models.project import Project


class DomainRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_workspace(self, workspace_id: uuid.UUID) -> List[tuple[ResearchDomain, int]]:
        query = (
            select(ResearchDomain, func.count(Project.id).label("project_count"))
            .outerjoin(Project, Project.domain_id == ResearchDomain.id)
            .where(ResearchDomain.workspace_id == workspace_id)
            .group_by(ResearchDomain.id)
            .order_by(ResearchDomain.created_at.asc())
        )
        result = await self.db.execute(query)
        return result.all()

    async def get_by_id(self, domain_id: uuid.UUID) -> Optional[ResearchDomain]:
        query = select(ResearchDomain).where(ResearchDomain.id == domain_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_slug(self, workspace_id: uuid.UUID, slug: str) -> Optional[ResearchDomain]:
        query = select(ResearchDomain).where(
            ResearchDomain.workspace_id == workspace_id,
            ResearchDomain.slug == slug,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, domain: ResearchDomain) -> ResearchDomain:
        self.db.add(domain)
        await self.db.commit()
        await self.db.refresh(domain)
        return domain

    async def update(self, domain: ResearchDomain) -> ResearchDomain:
        await self.db.commit()
        await self.db.refresh(domain)
        return domain

    async def delete(self, domain: ResearchDomain) -> None:
        await self.db.delete(domain)
        await self.db.commit()
