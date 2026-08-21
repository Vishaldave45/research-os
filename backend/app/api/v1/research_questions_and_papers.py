import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.research_question_and_paper import (
    ResearchQuestionCreate,
    ResearchQuestionRead,
    PaperCreate,
    PaperRead,
)
from app.services.research_question_and_paper_service import (
    ResearchQuestionService,
    PaperService,
)
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership

questions_router = APIRouter(prefix="/questions", tags=["Research Questions"])
papers_router = APIRouter(prefix="/papers", tags=["Papers"])


# --- Research Questions ---
@questions_router.get("", response_model=List[ResearchQuestionRead], status_code=status.HTTP_200_OK)
async def list_questions(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
):
    """List research questions for the active workspace."""
    workspace_id, _ = ws_ctx
    service = ResearchQuestionService(db)
    return await service.list_questions(workspace_id, status_filter=status_filter, search=search)


@questions_router.post("", response_model=ResearchQuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_in: ResearchQuestionCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new research question in the active workspace."""
    workspace_id, _ = ws_ctx
    service = ResearchQuestionService(db)
    return await service.create_question(question_in, workspace_id, current_user.id)


@questions_router.get("/{question_id}", response_model=ResearchQuestionRead, status_code=status.HTTP_200_OK)
async def get_question(
    question_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get single research question details."""
    workspace_id, _ = ws_ctx
    service = ResearchQuestionService(db)
    return await service.get_question(question_id, workspace_id)


# --- Papers ---
@papers_router.get("", response_model=List[PaperRead], status_code=status.HTTP_200_OK)
async def list_papers(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    search: Optional[str] = Query(None),
):
    """List papers for the active workspace."""
    workspace_id, _ = ws_ctx
    service = PaperService(db)
    return await service.list_papers(workspace_id, search=search)


@papers_router.post("", response_model=PaperRead, status_code=status.HTTP_201_CREATED)
async def create_paper(
    paper_in: PaperCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new paper record in the active workspace and optionally link to questions."""
    workspace_id, _ = ws_ctx
    service = PaperService(db)
    return await service.create_paper(paper_in, workspace_id, current_user.id)


@papers_router.get("/{paper_id}", response_model=PaperRead, status_code=status.HTTP_200_OK)
async def get_paper(
    paper_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get paper details."""
    workspace_id, _ = ws_ctx
    service = PaperService(db)
    return await service.get_paper(paper_id, workspace_id)
