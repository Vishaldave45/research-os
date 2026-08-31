import uuid
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_workspace_context
from app.models.workspace import WorkspaceMembership
from app.schemas.search_and_timeline import GlobalSearchResponse
from app.services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["Global Search"])


@router.get("", response_model=GlobalSearchResponse, status_code=status.HTTP_200_OK)
async def global_search(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    q: str = Query(..., min_length=1, description="Global search query string"),
    type: Optional[str] = Query(None, description="Optional entity archetype filter"),
    limit: int = Query(50, ge=1, le=200),
):
    workspace_id, _ = ws_ctx
    service = SearchService(db)
    return await service.search(
        workspace_id=workspace_id,
        query=q,
        type_filter=type,
        limit=limit,
    )
