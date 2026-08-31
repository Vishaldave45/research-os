import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_workspace_context
from app.models.workspace import WorkspaceMembership
from app.schemas.manuscript import ManuscriptExportRequest, ManuscriptBundleResponse
from app.services.manuscript_service import ManuscriptService

router = APIRouter(prefix="/manuscripts", tags=["PublicationOS"])


@router.post("/export", response_model=ManuscriptBundleResponse, status_code=status.HTTP_200_OK)
async def export_manuscript(
    request: ManuscriptExportRequest,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = ManuscriptService(db)
    return await service.compile_manuscript(workspace_id=workspace_id, request=request)


@router.get("/bibtex", status_code=status.HTTP_200_OK)
async def download_bibtex(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = ManuscriptService(db)
    bundle = await service.compile_manuscript(workspace_id=workspace_id, request=ManuscriptExportRequest())
    return Response(
        content=bundle.bibtex_content,
        media_type="text/plain",
        headers={"Content-Disposition": 'attachment; filename="references.bib"'},
    )


@router.get("/latex", status_code=status.HTTP_200_OK)
async def download_latex(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    workspace_id, _ = ws_ctx
    service = ManuscriptService(db)
    bundle = await service.compile_manuscript(workspace_id=workspace_id, request=ManuscriptExportRequest())
    return Response(
        content=bundle.latex_source,
        media_type="application/x-tex",
        headers={"Content-Disposition": 'attachment; filename="manuscript.tex"'},
    )
