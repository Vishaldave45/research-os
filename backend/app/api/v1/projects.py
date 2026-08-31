import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead
from app.services.project_service import ProjectService

from app.api.deps import get_current_workspace_context
from app.models.workspace import WorkspaceMembership

router = APIRouter(tags=["Research Projects"])


@router.get(
    "/projects",
    response_model=List[ProjectRead],
    summary="List projects in current active workspace context",
)
async def list_active_workspace_projects(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    status: Optional[str] = Query(None, pattern=r"^(active|completed|archived)$"),
):
    workspace_id, _ = ws_ctx
    service = ProjectService(db)
    return await service.list_projects(workspace_id, current_user.id, status)


@router.post(
    "/projects",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create project in current active workspace context",
)
async def create_active_workspace_project(
    project_in: ProjectCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    workspace_id, _ = ws_ctx
    service = ProjectService(db)
    return await service.create_project(workspace_id, current_user.id, project_in)


@router.get(
    "/workspaces/{workspace_id}/projects",
    response_model=List[ProjectRead],
    summary="List all research projects in a workspace",
)
async def list_workspace_projects(
    workspace_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    status: Optional[str] = Query(None, pattern=r"^(active|completed|archived)$"),
):
    service = ProjectService(db)
    return await service.list_projects(workspace_id, current_user.id, status)


@router.post(
    "/workspaces/{workspace_id}/projects",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new research project line",
)
async def create_workspace_project(
    workspace_id: uuid.UUID,
    project_in: ProjectCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = ProjectService(db)
    return await service.create_project(workspace_id, current_user.id, project_in)


@router.get(
    "/projects/{project_id}",
    response_model=ProjectRead,
    summary="Get research project details and summary counts",
)
async def get_project(
    project_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = ProjectService(db)
    return await service.get_project(project_id, current_user.id)


@router.put(
    "/projects/{project_id}",
    response_model=ProjectRead,
    summary="Update research project details",
)
async def update_project(
    project_id: uuid.UUID,
    project_in: ProjectUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = ProjectService(db)
    return await service.update_project(project_id, current_user.id, project_in)


@router.delete(
    "/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a research project",
)
async def delete_project(
    project_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = ProjectService(db)
    await service.delete_project(project_id, current_user.id)
    return None
