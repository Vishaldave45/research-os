import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.gap import Gap
from app.models.hypothesis import Hypothesis
from app.models.relationship import Relationship
from app.schemas.gap_and_hypothesis import (
    GapCreate,
    GapRead,
    HypothesisCreate,
    HypothesisRead,
)
from app.repositories.gap_and_hypothesis_repository import (
    GapRepository,
    HypothesisRepository,
)
from app.repositories.research_question_and_paper_repository import (
    ResearchQuestionRepository,
    PaperRepository,
)


class GapService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.gap_repo = GapRepository(db)
        self.question_repo = ResearchQuestionRepository(db)
        self.paper_repo = PaperRepository(db)

    async def create_gap(
        self,
        gap_in: GapCreate,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> GapRead:
        code = gap_in.code or await self.gap_repo.get_next_code(workspace_id)

        gap = Gap(
            workspace_id=workspace_id,
            code=code,
            title=gap_in.title.strip(),
            description=gap_in.description.strip(),
            impact_level=gap_in.impact_level,
            status=gap_in.status,
            metadata_json=gap_in.metadata,
            created_by=user_id,
        )
        created = await self.gap_repo.create(gap)

        # Link to questions (gap motivates or relates to question)
        for q_id in gap_in.linked_question_ids:
            q = await self.question_repo.get_by_id(q_id, workspace_id)
            if q:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="gap",
                    source_id=created.id,
                    target_type="question",
                    target_id=q.id,
                    relation_type="motivates",
                    created_by=user_id,
                )
                self.db.add(rel)

        # Link to papers (gap identified from paper)
        for p_id in gap_in.linked_paper_ids:
            p = await self.paper_repo.get_by_id(p_id, workspace_id)
            if p:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="paper",
                    source_id=p.id,
                    target_type="gap",
                    target_id=created.id,
                    relation_type="identifies",
                    created_by=user_id,
                )
                self.db.add(rel)

        return GapRead.model_validate(created)

    async def list_gaps(
        self,
        workspace_id: uuid.UUID,
        status_filter: Optional[str] = None,
        impact_level: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[GapRead]:
        items = await self.gap_repo.list(
            workspace_id,
            status=status_filter,
            impact_level=impact_level,
            search=search,
        )
        return [GapRead.model_validate(item) for item in items]

    async def get_gap(self, gap_id: uuid.UUID, workspace_id: uuid.UUID) -> GapRead:
        item = await self.gap_repo.get_by_id(gap_id, workspace_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research gap not found.",
            )
        return GapRead.model_validate(item)


class HypothesisService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.hypothesis_repo = HypothesisRepository(db)
        self.gap_repo = GapRepository(db)
        self.question_repo = ResearchQuestionRepository(db)

    async def create_hypothesis(
        self,
        hypothesis_in: HypothesisCreate,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> HypothesisRead:
        code = hypothesis_in.code or await self.hypothesis_repo.get_next_code(workspace_id)

        hypothesis = Hypothesis(
            workspace_id=workspace_id,
            code=code,
            statement=hypothesis_in.statement.strip(),
            rationale=hypothesis_in.rationale.strip() if hypothesis_in.rationale else None,
            expected_outcome=hypothesis_in.expected_outcome.strip() if hypothesis_in.expected_outcome else None,
            status=hypothesis_in.status,
            metadata_json=hypothesis_in.metadata,
            created_by=user_id,
        )
        created = await self.hypothesis_repo.create(hypothesis)

        # Link to gaps (hypothesis addresses gap)
        for g_id in hypothesis_in.linked_gap_ids:
            g = await self.gap_repo.get_by_id(g_id, workspace_id)
            if g:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="hypothesis",
                    source_id=created.id,
                    target_type="gap",
                    target_id=g.id,
                    relation_type="addresses",
                    created_by=user_id,
                )
                self.db.add(rel)

        # Link to questions (hypothesis tests/investigates question)
        for q_id in hypothesis_in.linked_question_ids:
            q = await self.question_repo.get_by_id(q_id, workspace_id)
            if q:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="hypothesis",
                    source_id=created.id,
                    target_type="question",
                    target_id=q.id,
                    relation_type="tests",
                    created_by=user_id,
                )
                self.db.add(rel)

        return HypothesisRead.model_validate(created)

    async def list_hypotheses(
        self,
        workspace_id: uuid.UUID,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[HypothesisRead]:
        items = await self.hypothesis_repo.list(workspace_id, status=status_filter, search=search)
        return [HypothesisRead.model_validate(item) for item in items]

    async def get_hypothesis(self, hypothesis_id: uuid.UUID, workspace_id: uuid.UUID) -> HypothesisRead:
        item = await self.hypothesis_repo.get_by_id(hypothesis_id, workspace_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hypothesis not found.",
            )
        return HypothesisRead.model_validate(item)
