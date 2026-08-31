import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class EvidenceBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255, description="Concise evidence claim or observation")
    summary: str = Field(..., min_length=5, description="Full empirical or theoretical summary of the evidence")
    evidence_type: str = Field("empirical", description="empirical, theoretical, benchmark, or anecdotal")
    strength: str = Field("moderate", description="strong, moderate, weak, or inconclusive")
    source_type: str = Field("paper", description="paper, experiment, result, or external_dataset")
    source_id: Optional[uuid.UUID] = Field(None, description="Optional UUID link to source Paper, Result, etc.")
    citation_doi: Optional[str] = Field(None, description="DOI or publication identifier")
    confidence_score: int = Field(70, ge=0, le=100, description="Evidentiary confidence rating 0-100")
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    summary: Optional[str] = Field(None, min_length=5)
    evidence_type: Optional[str] = None
    strength: Optional[str] = None
    source_type: Optional[str] = None
    source_id: Optional[uuid.UUID] = None
    citation_doi: Optional[str] = None
    confidence_score: Optional[int] = Field(None, ge=0, le=100)
    metadata_json: Optional[Dict[str, Any]] = None


class EvidenceRead(EvidenceBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
