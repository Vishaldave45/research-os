import uuid
from typing import Annotated, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.domain import DomainCreate, DomainUpdate, DomainRead
from app.services.domain_service import DomainService

router = APIRouter(tags=["Research Domains"])


@router.get(
    "/workspaces/{workspace_id}/domains",
    response_model=List[DomainRead],
    summary="List all research domains in a workspace",
)
async def list_workspace_domains(
    workspace_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = DomainService(db)
    return await service.list_domains(workspace_id, current_user.id)


@router.post(
    "/workspaces/{workspace_id}/domains",
    response_model=DomainRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a research domain in a workspace",
)
async def create_workspace_domain(
    workspace_id: uuid.UUID,
    domain_in: DomainCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = DomainService(db)
    return await service.create_domain(workspace_id, current_user.id, domain_in)


@router.get(
    "/domains/{domain_id}",
    response_model=DomainRead,
    summary="Get research domain details",
)
async def get_domain(
    domain_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = DomainService(db)
    return await service.get_domain(domain_id, current_user.id)


@router.put(
    "/domains/{domain_id}",
    response_model=DomainRead,
    summary="Update research domain",
)
async def update_domain(
    domain_id: uuid.UUID,
    domain_in: DomainUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = DomainService(db)
    return await service.update_domain(domain_id, current_user.id, domain_in)


@router.delete(
    "/domains/{domain_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete research domain",
)
async def delete_domain(
    domain_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    service = DomainService(db)
    await service.delete_domain(domain_id, current_user.id)
