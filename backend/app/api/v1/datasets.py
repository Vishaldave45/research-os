import uuid
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.schemas.dataset import DatasetCreate, DatasetUpdate, DatasetRead
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["Dataset Registry"])


@router.get("", response_model=List[DatasetRead], status_code=status.HTTP_200_OK)
async def list_datasets(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
    modality: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    workspace_id, _ = ws_ctx
    service = DatasetService(db)
    return await service.list_datasets(
        workspace_id=workspace_id,
        modality=modality,
        search=search,
    )


@router.post("", response_model=DatasetRead, status_code=status.HTTP_201_CREATED)
async def create_dataset(
    dataset_in: DatasetCreate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = DatasetService(db)
    return await service.create_dataset(workspace_id, current_user.id, dataset_in)


@router.get("/{dataset_id}", response_model=DatasetRead, status_code=status.HTTP_200_OK)
async def get_dataset(
    dataset_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = DatasetService(db)
    return await service.get_dataset(dataset_id, workspace_id)


@router.put("/{dataset_id}", response_model=DatasetRead, status_code=status.HTTP_200_OK)
async def update_dataset(
    dataset_id: uuid.UUID,
    dataset_in: DatasetUpdate,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = DatasetService(db)
    return await service.update_dataset(dataset_id, workspace_id, dataset_in)


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(
    dataset_id: uuid.UUID,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = DatasetService(db)
    await service.delete_dataset(dataset_id, workspace_id)
