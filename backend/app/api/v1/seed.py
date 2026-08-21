import uuid
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.seed_service import SeedService
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/seed", tags=["Seed Datasets"])


@router.post(
    "/wce/{workspace_id}",
    response_model=Dict[str, Any],
    summary="Seed Wireless Capsule Endoscopy (WCE) Research Project",
)
async def seed_wce_dataset(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    ws_service = WorkspaceService(db)
    is_member = await ws_service.is_workspace_member(workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this workspace.",
        )

    seed_service = SeedService(db)
    return await seed_service.seed_wce_dataset(workspace_id, current_user.id)
