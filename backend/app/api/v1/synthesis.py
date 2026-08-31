import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.synthesis_service import SynthesisService
from app.services.workspace_service import WorkspaceService
from app.schemas.synthesis import (
    LiteratureSynthesisRequest,
    LiteratureSynthesisResponse,
    GapAnalysisRequest,
    GapAnalysisResponse,
    ClaimValidationRequest,
    ClaimValidationResponse,
    EvidenceChainSummaryResponse,
)

router = APIRouter(prefix="/synthesis", tags=["Synthesis & AI Research Intelligence"])


async def verify_workspace_access(
    workspace_id: uuid.UUID,
    user: User,
    db: AsyncSession,
) -> None:
    ws_service = WorkspaceService(db)
    is_member = await ws_service.is_workspace_member(workspace_id, user.id)
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this workspace.",
        )


@router.post(
    "/literature/{workspace_id}",
    response_model=LiteratureSynthesisResponse,
    summary="Synthesize Literature Review & Comparative Matrix",
)
async def synthesize_literature(
    workspace_id: uuid.UUID,
    req: LiteratureSynthesisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LiteratureSynthesisResponse:
    await verify_workspace_access(workspace_id, current_user, db)
    service = SynthesisService(db)
    return await service.synthesize_literature(workspace_id, req)


@router.post(
    "/gap-analysis/{workspace_id}",
    response_model=GapAnalysisResponse,
    summary="AI-Assisted Gap Analysis & Hypothesis Proposal",
)
async def analyze_gaps(
    workspace_id: uuid.UUID,
    req: GapAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> GapAnalysisResponse:
    await verify_workspace_access(workspace_id, current_user, db)
    service = SynthesisService(db)
    return await service.analyze_gaps(workspace_id, req)


@router.post(
    "/validate-claim/{workspace_id}",
    response_model=ClaimValidationResponse,
    summary="Verify Evidentiary Support & Graph Grounding for Claim",
)
async def validate_claim(
    workspace_id: uuid.UUID,
    req: ClaimValidationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ClaimValidationResponse:
    await verify_workspace_access(workspace_id, current_user, db)
    service = SynthesisService(db)
    try:
        return await service.validate_claim(workspace_id, req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/evidence-chain/{workspace_id}/{question_id}",
    response_model=EvidenceChainSummaryResponse,
    summary="Synthesize Full End-to-End Evidence Chain Narrative",
)
async def summarize_evidence_chain(
    workspace_id: uuid.UUID,
    question_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EvidenceChainSummaryResponse:
    await verify_workspace_access(workspace_id, current_user, db)
    service = SynthesisService(db)
    try:
        return await service.summarize_evidence_chain(workspace_id, question_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# --- Phase 6: Synthesis AI Engine Endpoints ---
from app.api.deps import get_current_workspace_context
from app.models.workspace import WorkspaceMembership
from app.schemas.synthesis_engine import (
    GapDiscoveryRequest,
    GapDiscoveryResponse,
    HypothesisGenerationRequest,
    HypothesisGenerationResponse,
    ClaimAuditRequest,
    ClaimAuditResponse,
    InsertProposalRequest,
)
from app.services.synthesis_ai_service import SynthesisAIService


@router.post("/discover-gaps", response_model=GapDiscoveryResponse, status_code=status.HTTP_200_OK)
async def discover_gaps_ai(
    req: GapDiscoveryRequest,
    ws_ctx: tuple[uuid.UUID, WorkspaceMembership] = Depends(get_current_workspace_context),
    db: AsyncSession = Depends(get_db),
):
    workspace_id, _ = ws_ctx
    service = SynthesisAIService(db)
    return await service.discover_gaps(workspace_id, req)


@router.post("/generate-hypotheses", response_model=HypothesisGenerationResponse, status_code=status.HTTP_200_OK)
async def generate_hypotheses_ai(
    req: HypothesisGenerationRequest,
    ws_ctx: tuple[uuid.UUID, WorkspaceMembership] = Depends(get_current_workspace_context),
    db: AsyncSession = Depends(get_db),
):
    workspace_id, _ = ws_ctx
    service = SynthesisAIService(db)
    return await service.generate_hypotheses(workspace_id, req)


@router.post("/audit-claim", response_model=ClaimAuditResponse, status_code=status.HTTP_200_OK)
async def audit_claim_ai(
    req: ClaimAuditRequest,
    ws_ctx: tuple[uuid.UUID, WorkspaceMembership] = Depends(get_current_workspace_context),
    db: AsyncSession = Depends(get_db),
):
    workspace_id, _ = ws_ctx
    service = SynthesisAIService(db)
    return await service.audit_claim(workspace_id, req)


@router.post("/accept-proposal", status_code=status.HTTP_201_CREATED)
async def accept_proposal_into_graph(
    req: InsertProposalRequest,
    ws_ctx: tuple[uuid.UUID, WorkspaceMembership] = Depends(get_current_workspace_context),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    workspace_id, _ = ws_ctx
    service = SynthesisAIService(db)
    return await service.accept_proposal(workspace_id, current_user.id, req)
