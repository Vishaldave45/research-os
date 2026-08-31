import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.schemas.model_registry import ModelCreate, ModelUpdate, ModelRead
from app.services.model_service import ModelService

router = APIRouter(prefix="/models", tags=["Model Registry"])


@router.get("", response_model=List[ModelRead], status_code=status.HTTP_200_OK)
async def list_models(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    architecture: Optional[str] = Query(None),
    framework: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    workspace_id, _ = ws_ctx
    service = ModelService(db)
    return await service.list_models(
        workspace_id=workspace_id,
        architecture=architecture,
        framework=framework,
        search=search,
    )


@router.post("", response_model=ModelRead, status_code=status.HTTP_201_CREATED)
async def create_model(
    model_in: ModelCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = ModelService(db)
    return await service.create_model(workspace_id, current_user.id, model_in)


@router.get("/{model_id}", response_model=ModelRead, status_code=status.HTTP_200_OK)
async def get_model(
    model_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = ModelService(db)
    return await service.get_model(model_id, workspace_id)


@router.put("/{model_id}", response_model=ModelRead, status_code=status.HTTP_200_OK)
async def update_model(
    model_id: uuid.UUID,
    model_in: ModelUpdate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = ModelService(db)
    return await service.update_model(model_id, workspace_id, model_in)


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = ModelService(db)
    await service.delete_model(model_id, workspace_id)
