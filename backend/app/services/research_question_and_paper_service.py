import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.research_question import ResearchQuestion
from app.models.paper import Paper
from app.models.relationship import Relationship
from app.schemas.research_question_and_paper import (
    ResearchQuestionCreate,
    ResearchQuestionRead,
    ResearchQuestionUpdate,
    PaperCreate,
    PaperRead,
    PaperUpdate,
)
from app.repositories.research_question_and_paper_repository import (
    ResearchQuestionRepository,
    PaperRepository,
)


class ResearchQuestionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.question_repo = ResearchQuestionRepository(db)
        self.paper_repo = PaperRepository(db)

    async def create_question(
        self,
        question_in: ResearchQuestionCreate,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ResearchQuestionRead:
        code = question_in.code or await self.question_repo.get_next_code(workspace_id)
        
        question = ResearchQuestion(
            workspace_id=workspace_id,
            code=code,
            title=question_in.title.strip(),
            description=question_in.description.strip() if question_in.description else None,
            status=question_in.status,
            metadata_json=question_in.metadata,
            created_by=user_id,
        )
        created = await self.question_repo.create(question)

        # Handle initial links to papers
        for paper_id in question_in.linked_paper_ids:
            paper = await self.paper_repo.get_by_id(paper_id, workspace_id)
            if paper:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="paper",
                    source_id=paper.id,
                    target_type="question",
                    target_id=created.id,
                    relation_type="informs",
                    created_by=user_id,
                )
                self.db.add(rel)

        return ResearchQuestionRead.model_validate(created)

    async def list_questions(
        self,
        workspace_id: uuid.UUID,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ResearchQuestionRead]:
        items = await self.question_repo.list(workspace_id, status=status_filter, search=search)
        return [ResearchQuestionRead.model_validate(item) for item in items]

    async def get_question(self, question_id: uuid.UUID, workspace_id: uuid.UUID) -> ResearchQuestionRead:
        item = await self.question_repo.get_by_id(question_id, workspace_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research question not found.",
            )
        return ResearchQuestionRead.model_validate(item)


class PaperService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.paper_repo = PaperRepository(db)
        self.question_repo = ResearchQuestionRepository(db)

    async def create_paper(
        self,
        paper_in: PaperCreate,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> PaperRead:
        code = paper_in.code or await self.paper_repo.get_next_code(workspace_id)
        
        paper = Paper(
            workspace_id=workspace_id,
            code=code,
            title=paper_in.title.strip(),
            authors=paper_in.authors,
            year=paper_in.year,
            venue=paper_in.venue.strip() if paper_in.venue else None,
            doi=paper_in.doi.strip() if paper_in.doi else None,
            url=paper_in.url.strip() if paper_in.url else None,
            abstract=paper_in.abstract.strip() if paper_in.abstract else None,
            notes=paper_in.notes.strip() if paper_in.notes else None,
            metadata_json=paper_in.metadata,
            created_by=user_id,
        )
        created = await self.paper_repo.create(paper)

        # Handle initial links to questions
        for question_id in paper_in.linked_question_ids:
            question = await self.question_repo.get_by_id(question_id, workspace_id)
            if question:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="paper",
                    source_id=created.id,
                    target_type="question",
                    target_id=question.id,
                    relation_type="informs",
                    created_by=user_id,
                )
                self.db.add(rel)

        return PaperRead.model_validate(created)

    async def list_papers(
        self,
        workspace_id: uuid.UUID,
        search: Optional[str] = None,
    ) -> List[PaperRead]:
        items = await self.paper_repo.list(workspace_id, search=search)
        return [PaperRead.model_validate(item) for item in items]

    async def get_paper(self, paper_id: uuid.UUID, workspace_id: uuid.UUID) -> PaperRead:
        item = await self.paper_repo.get_by_id(paper_id, workspace_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paper not found.",
            )
        return PaperRead.model_validate(item)
