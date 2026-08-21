import uuid
from typing import Optional, List
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.gap import Gap
from app.models.hypothesis import Hypothesis


class GapRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, gap_id: uuid.UUID, workspace_id: uuid.UUID) -> Optional[Gap]:
        stmt = select(Gap).where(
            Gap.id == gap_id,
            Gap.workspace_id == workspace_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_next_code(self, workspace_id: uuid.UUID) -> str:
        stmt = select(func.count(Gap.id)).where(Gap.workspace_id == workspace_id)
        result = await self.db.execute(stmt)
        count = result.scalar() or 0
        return f"G-{(count + 1):03d}"

    async def create(self, gap: Gap) -> Gap:
        self.db.add(gap)
        await self.db.flush()
        await self.db.refresh(gap)
        return gap

    async def list(
        self,
        workspace_id: uuid.UUID,
        status: Optional[str] = None,
        impact_level: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Gap]:
        stmt = select(Gap).where(Gap.workspace_id == workspace_id)
        if status:
            stmt = stmt.where(Gap.status == status)
        if impact_level:
            stmt = stmt.where(Gap.impact_level == impact_level)
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Gap.title.ilike(search_pattern),
                    Gap.code.ilike(search_pattern),
                    Gap.description.ilike(search_pattern),
                )
            )
        stmt = stmt.order_by(Gap.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())


class HypothesisRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, hypothesis_id: uuid.UUID, workspace_id: uuid.UUID) -> Optional[Hypothesis]:
        stmt = select(Hypothesis).where(
            Hypothesis.id == hypothesis_id,
            Hypothesis.workspace_id == workspace_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_next_code(self, workspace_id: uuid.UUID) -> str:
        stmt = select(func.count(Hypothesis.id)).where(Hypothesis.workspace_id == workspace_id)
        result = await self.db.execute(stmt)
        count = result.scalar() or 0
        return f"H-{(count + 1):03d}"

    async def create(self, hypothesis: Hypothesis) -> Hypothesis:
        self.db.add(hypothesis)
        await self.db.flush()
        await self.db.refresh(hypothesis)
        return hypothesis

    async def list(
        self,
        workspace_id: uuid.UUID,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Hypothesis]:
        stmt = select(Hypothesis).where(Hypothesis.workspace_id == workspace_id)
        if status:
            stmt = stmt.where(Hypothesis.status == status)
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Hypothesis.statement.ilike(search_pattern),
                    Hypothesis.code.ilike(search_pattern),
                    Hypothesis.rationale.ilike(search_pattern),
                    Hypothesis.expected_outcome.ilike(search_pattern),
                )
            )
        stmt = stmt.order_by(Hypothesis.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
