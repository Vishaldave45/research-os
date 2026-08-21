import uuid
from typing import Optional, List
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.research_question import ResearchQuestion
from app.models.paper import Paper
from app.models.relationship import Relationship


class ResearchQuestionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, question_id: uuid.UUID, workspace_id: uuid.UUID) -> Optional[ResearchQuestion]:
        stmt = select(ResearchQuestion).where(
            ResearchQuestion.id == question_id,
            ResearchQuestion.workspace_id == workspace_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_next_code(self, workspace_id: uuid.UUID) -> str:
        stmt = select(func.count(ResearchQuestion.id)).where(ResearchQuestion.workspace_id == workspace_id)
        result = await self.db.execute(stmt)
        count = result.scalar() or 0
        return f"Q-{(count + 1):03d}"

    async def create(self, question: ResearchQuestion) -> ResearchQuestion:
        self.db.add(question)
        await self.db.flush()
        await self.db.refresh(question)
        return question

    async def list(
        self,
        workspace_id: uuid.UUID,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ResearchQuestion]:
        stmt = select(ResearchQuestion).where(ResearchQuestion.workspace_id == workspace_id)
        if status:
            stmt = stmt.where(ResearchQuestion.status == status)
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    ResearchQuestion.title.ilike(search_pattern),
                    ResearchQuestion.code.ilike(search_pattern),
                    ResearchQuestion.description.ilike(search_pattern),
                )
            )
        stmt = stmt.order_by(ResearchQuestion.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())


class PaperRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, paper_id: uuid.UUID, workspace_id: uuid.UUID) -> Optional[Paper]:
        stmt = select(Paper).where(
            Paper.id == paper_id,
            Paper.workspace_id == workspace_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_next_code(self, workspace_id: uuid.UUID) -> str:
        stmt = select(func.count(Paper.id)).where(Paper.workspace_id == workspace_id)
        result = await self.db.execute(stmt)
        count = result.scalar() or 0
        return f"P-{(count + 1):03d}"

    async def create(self, paper: Paper) -> Paper:
        self.db.add(paper)
        await self.db.flush()
        await self.db.refresh(paper)
        return paper

    async def list(
        self,
        workspace_id: uuid.UUID,
        search: Optional[str] = None,
    ) -> List[Paper]:
        stmt = select(Paper).where(Paper.workspace_id == workspace_id)
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Paper.title.ilike(search_pattern),
                    Paper.code.ilike(search_pattern),
                    Paper.abstract.ilike(search_pattern),
                )
            )
        stmt = stmt.order_by(Paper.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
