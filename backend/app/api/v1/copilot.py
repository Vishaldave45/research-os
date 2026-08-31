from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional, Annotated
from pydantic import BaseModel, Field
import uuid

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.ai.gateway.provider import get_ai_provider
from app.ai.context.context_builder import GraphContextBuilder

router = APIRouter(prefix="/ai/copilot", tags=["AI Research Copilot"])

class CopilotQueryRequest(BaseModel):
    query: str
    focus_entity_id: Optional[str] = None
    provider: Optional[str] = "local"
    temperature: float = 0.2

class CopilotQueryResponse(BaseModel):
    answer: str
    citations: List[str]
    model: str
    provider: str
    grounded_context_length: int

@router.post("/query", response_model=CopilotQueryResponse)
async def query_research_copilot(
    payload: CopilotQueryRequest,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Query the Research Copilot with authorized PostgreSQL graph context and entity citations."""
    workspace_id, _ = ws_ctx
    context_builder = GraphContextBuilder(db, workspace_id)
    graph_context = await context_builder.build_full_context()

    provider = get_ai_provider(payload.provider)
    system_instruction = (
        "You are the ResearchOS AI Copilot. You assist researchers in synthesizing literature, "
        "formulating hypotheses, evaluating benchmark experiments, and verifying scientific claims. "
        "Always cite specific entity codes (e.g. [P-001], [H-001], [R-001], [D-001]) present in the context."
    )

    ai_res = await provider.generate_response(
        prompt=payload.query,
        system_instruction=system_instruction,
        context=graph_context,
        temperature=payload.temperature,
    )

    return CopilotQueryResponse(
        answer=ai_res.get("text", ""),
        citations=ai_res.get("citations", []),
        model=ai_res.get("model", "default"),
        provider=ai_res.get("provider", "local"),
        grounded_context_length=len(graph_context),
    )
