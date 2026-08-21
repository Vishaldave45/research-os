import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class GapBase(BaseModel):
    code: Optional[str] = Field(None, max_length=32, description="Unique code e.g. G-001")
    title: str = Field(..., min_length=3, description="Identified research gap title")
    description: str = Field(..., min_length=10, description="Detailed explanation of the limitation or unanswered gap")
    impact_level: str = Field("high", pattern=r"^(critical|high|medium|low)$")
    status: str = Field("open", pattern=r"^(open|addressed|deprecated)$")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GapCreate(GapBase):
    linked_question_ids: List[uuid.UUID] = Field(default_factory=list, description="Questions motivating this gap")
    linked_paper_ids: List[uuid.UUID] = Field(default_factory=list, description="Papers where this gap was identified")


class GapUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = Field(None, min_length=10)
    impact_level: Optional[str] = Field(None, pattern=r"^(critical|high|medium|low)$")
    status: Optional[str] = Field(None, pattern=r"^(open|addressed|deprecated)$")
    metadata: Optional[Dict[str, Any]] = None


class GapRead(GapBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HypothesisBase(BaseModel):
    code: Optional[str] = Field(None, max_length=32, description="Unique code e.g. H-001")
    statement: str = Field(..., min_length=10, description="Falsifiable hypothesis proposition")
    rationale: Optional[str] = Field(None, description="Theoretical or empirical reasoning behind the hypothesis")
    expected_outcome: Optional[str] = Field(None, description="Measurable predicted outcome")
    status: str = Field("draft", pattern=r"^(draft|testing|supported|refuted|abandoned)$")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HypothesisCreate(HypothesisBase):
    linked_gap_ids: List[uuid.UUID] = Field(default_factory=list, description="Gaps this hypothesis addresses")
    linked_question_ids: List[uuid.UUID] = Field(default_factory=list, description="Questions this hypothesis seeks to answer")


class HypothesisUpdate(BaseModel):
    statement: Optional[str] = Field(None, min_length=10)
    rationale: Optional[str] = None
    expected_outcome: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(draft|testing|supported|refuted|abandoned)$")
    metadata: Optional[Dict[str, Any]] = None


class HypothesisRead(HypothesisBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
