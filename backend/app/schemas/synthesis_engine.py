import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# --- Gap Discovery ---
class GapDiscoveryRequest(BaseModel):
    paper_ids: Optional[List[uuid.UUID]] = Field(None, description="Optional subset of papers to analyze")
    focus_topic: Optional[str] = Field(None, description="Specific research focus or domain query")
    max_gaps: int = Field(5, ge=1, le=20)


class DiscoveredGapResult(BaseModel):
    title: str
    description: str
    impact_level: str  # high, medium, low
    related_paper_codes: List[str] = Field(default_factory=list)
    suggested_hypotheses: List[str] = Field(default_factory=list)
    confidence_score: float = Field(0.85, ge=0.0, le=1.0)


class GapDiscoveryResponse(BaseModel):
    workspace_id: uuid.UUID
    analyzed_papers_count: int
    discovered_gaps: List[DiscoveredGapResult]


# --- Hypothesis Generation ---
class HypothesisGenerationRequest(BaseModel):
    gap_id: Optional[uuid.UUID] = Field(None, description="Optional target gap to address")
    gap_description: Optional[str] = Field(None, description="Optional text description of gap")
    domain_context: Optional[str] = Field(None, description="Target domain or methodology context")
    max_candidates: int = Field(3, ge=1, le=10)


class GeneratedHypothesisResult(BaseModel):
    statement: str
    rationale: str
    confidence: float = Field(0.85, ge=0.0, le=1.0)
    suggested_experiments: List[str] = Field(default_factory=list)
    falsifiability_criteria: str


class HypothesisGenerationResponse(BaseModel):
    workspace_id: uuid.UUID
    candidates: List[GeneratedHypothesisResult]


# --- Claim Validation & Audit ---
class ClaimAuditRequest(BaseModel):
    claim_id: Optional[uuid.UUID] = Field(None, description="Target claim ID if existing")
    statement: Optional[str] = Field(None, description="Claim text statement to evaluate")


class ClaimAuditResponse(BaseModel):
    claim_statement: str
    grounded_status: str  # verified, strongly_supported, weakly_supported, contradicted, unsupported
    confidence_score: float
    supporting_evidence_codes: List[str] = Field(default_factory=list)
    contradicting_evidence_codes: List[str] = Field(default_factory=list)
    critique_summary: str
    audit_verdict: str


# --- Accept Proposal into Graph ---
class InsertProposalRequest(BaseModel):
    proposal_type: str = Field(..., description="gap, hypothesis, claim")
    title_or_statement: str = Field(..., min_length=3)
    description_or_rationale: Optional[str] = None
    impact_or_confidence: Optional[str] = None  # e.g. 'high' or '0.9'
    connect_to_codes: List[str] = Field(default_factory=list, description="Codes of entities to automatically link")
