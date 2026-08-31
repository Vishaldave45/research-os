import uuid
from typing import List, Optional
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.evidence import Evidence


class EvidenceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_workspace(
        self,
        workspace_id: uuid.UUID,
        evidence_type: Optional[str] = None,
        strength: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Evidence]:
        query = select(Evidence).where(Evidence.workspace_id == workspace_id)
        if evidence_type:
            query = query.where(Evidence.evidence_type == evidence_type)
        if strength:
            query = query.where(Evidence.strength == strength)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Evidence.title.ilike(search_pattern),
                    Evidence.summary.ilike(search_pattern),
                    Evidence.code.ilike(search_pattern),
                )
            )
        query = query.order_by(Evidence.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, evidence_id: uuid.UUID) -> Optional[Evidence]:
        query = select(Evidence).where(Evidence.id == evidence_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_next_code(self, workspace_id: uuid.UUID) -> str:
        query = select(func.count(Evidence.id)).where(Evidence.workspace_id == workspace_id)
        result = await self.db.execute(query)
        count = result.scalar_one() or 0
        return f"EV-{count + 1:03d}"

    async def create(self, evidence: Evidence) -> Evidence:
        self.db.add(evidence)
        await self.db.commit()
        await self.db.refresh(evidence)
        return evidence

    async def update(self, evidence: Evidence) -> Evidence:
        await self.db.commit()
        await self.db.refresh(evidence)
        return evidence

    async def delete(self, evidence: Evidence) -> None:
        await self.db.delete(evidence)
        await self.db.commit()
