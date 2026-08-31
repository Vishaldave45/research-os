import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ManuscriptExportRequest(BaseModel):
    target_format: str = Field("full_bundle", description="latex, markdown, bibtex, full_bundle")
    template_style: str = Field("ieee", description="ieee, neurips, nature, generic")
    include_traceability_matrix: bool = Field(True, description="Whether to include full evidence-to-claim audit table")
    selected_claim_ids: Optional[List[uuid.UUID]] = Field(None, description="Optional subset of claims to center paper on")


class ManuscriptSection(BaseModel):
    section_key: str
    title: str
    content_markdown: str
    content_latex: str
    referenced_entity_codes: List[str] = Field(default_factory=list)


class TraceabilityRow(BaseModel):
    claim_code: str
    claim_statement: str
    confidence: float
    supporting_results: List[str]
    supporting_experiments: List[str]
    grounding_evidence: List[str]


class ManuscriptBundleResponse(BaseModel):
    workspace_id: uuid.UUID
    title: str
    abstract: str
    sections: List[ManuscriptSection]
    bibtex_content: str
    latex_source: str
    markdown_source: str
    evidence_traceability_matrix: List[TraceabilityRow]
