import uuid
from typing import Optional, List
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.decision import Decision


class DecisionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, decision_id: uuid.UUID, workspace_id: uuid.UUID) -> Optional[Decision]:
        stmt = select(Decision).where(
            Decision.id == decision_id,
            Decision.workspace_id == workspace_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_next_code(self, workspace_id: uuid.UUID) -> str:
        stmt = select(func.count(Decision.id)).where(Decision.workspace_id == workspace_id)
        result = await self.db.execute(stmt)
        count = result.scalar() or 0
        return f"D-{(count + 1):03d}"

    async def create(self, decision: Decision) -> Decision:
        self.db.add(decision)
        await self.db.flush()
        await self.db.refresh(decision)
        return decision

    async def list(
        self,
        workspace_id: uuid.UUID,
        outcome: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Decision]:
        stmt = select(Decision).where(Decision.workspace_id == workspace_id)
        if outcome:
            stmt = stmt.where(Decision.outcome == outcome)
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Decision.title.ilike(search_pattern),
                    Decision.code.ilike(search_pattern),
                    Decision.rationale.ilike(search_pattern),
                )
            )
        stmt = stmt.order_by(Decision.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
