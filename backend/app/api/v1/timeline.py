import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_workspace_context
from app.models.workspace import WorkspaceMembership
from app.schemas.search_and_timeline import TimelineResponse
from app.services.timeline_service import TimelineService

router = APIRouter(prefix="/timeline", tags=["Research Timeline"])


@router.get("", response_model=TimelineResponse, status_code=status.HTTP_200_OK)
async def get_workspace_timeline(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = TimelineService(db)
    return await service.get_timeline(workspace_id=workspace_id)
