import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field


class LiteratureMatrixRow(BaseModel):
    paper_id: str
    paper_code: str
    paper_title: str
    authors: str
    year: Optional[int] = None
    venue: Optional[str] = None
    methodology: str
    key_metrics: Dict[str, Any]
    strengths: List[str]
    limitations: List[str]


class LiteratureSynthesisRequest(BaseModel):
    paper_ids: Optional[List[uuid.UUID]] = Field(
        None,
        description="Optional subset of paper UUIDs to synthesize. If empty, all papers in workspace are synthesized.",
    )
    focus_topic: Optional[str] = Field(
        None,
        description="Optional thematic focus (e.g. 'Latency & Quantization' or 'Diagnostic Sensitivity')",
    )


class LiteratureSynthesisResponse(BaseModel):
    workspace_id: uuid.UUID
    executive_summary: str
    thematic_areas: List[str]
    comparative_matrix: List[LiteratureMatrixRow]
    consensus_findings: List[str]
    contested_findings: List[str]
    identified_gaps: List[str]
    generated_at: datetime


class DiscoveredGapProposal(BaseModel):
    title: str
    description: str
    impact_level: Literal["critical", "high", "medium", "low"]
    motivating_paper_codes: List[str]
    proposed_hypothesis: str
    recommended_experiment_protocol: str


class GapAnalysisRequest(BaseModel):
    research_question_id: Optional[uuid.UUID] = None
    focus_domain: Optional[str] = None


class GapAnalysisResponse(BaseModel):
    workspace_id: uuid.UUID
    analysis_overview: str
    discovered_gaps: List[DiscoveredGapProposal]
    recommended_next_steps: List[str]
    generated_at: datetime


class ClaimValidationRequest(BaseModel):
    claim_id: uuid.UUID


class ClaimValidationResponse(BaseModel):
    claim_id: uuid.UUID
    claim_code: str
    claim_statement: str
    current_status: str
    evidentiary_score: float  # 0.0 to 1.0
    support_level: Literal["strongly_supported", "partially_supported", "unsupported", "contradicted"]
    supporting_results: List[Dict[str, Any]]
    contradicting_results: List[Dict[str, Any]]
    citing_papers: List[Dict[str, Any]]
    validation_critique: str
    recommended_actions: List[str]


class EvidenceChainSummaryResponse(BaseModel):
    workspace_id: uuid.UUID
    question_code: str
    question_title: str
    total_connected_artifacts: int
    narrative_summary: str
    milestones: List[Dict[str, Any]]
    current_verdict: str
