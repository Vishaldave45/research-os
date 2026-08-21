import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator


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

    @model_validator(mode="before")
    @classmethod
    def handle_orm_obj(cls, data: Any) -> Any:
        if hasattr(data, "id") and not isinstance(data, dict):
            return {
                "id": getattr(data, "id", None),
                "workspace_id": getattr(data, "workspace_id", None),
                "code": getattr(data, "code", ""),
                "title": getattr(data, "title", ""),
                "description": getattr(data, "description", ""),
                "impact_level": getattr(data, "impact_level", "high"),
                "status": getattr(data, "status", "open"),
                "metadata": getattr(data, "metadata_json", {}) or {},
                "created_by": getattr(data, "created_by", None),
                "created_at": getattr(data, "created_at", None),
                "updated_at": getattr(data, "updated_at", None),
            }
        return data


class HypothesisBase(BaseModel):
    code: Optional[str] = Field(None, max_length=32, description="Unique code e.g. H-001")
    statement: str = Field(..., min_length=10, description="Falsifiable hypothesis proposition")
    rationale: Optional[str] = None
    expected_outcome: Optional[str] = None
    status: str = Field("draft", pattern=r"^(draft|testing|supported|refuted|abandoned)$")
    confidence_score: Optional[float] = Field(1.0, ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HypothesisCreate(HypothesisBase):
    linked_gap_ids: List[uuid.UUID] = Field(default_factory=list, description="Gaps this hypothesis addresses")
    linked_question_ids: List[uuid.UUID] = Field(default_factory=list, description="Questions this hypothesis seeks to answer")


class HypothesisUpdate(BaseModel):
    statement: Optional[str] = Field(None, min_length=10)
    rationale: Optional[str] = None
    expected_outcome: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(draft|testing|supported|refuted|abandoned)$")
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    metadata: Optional[Dict[str, Any]] = None


class HypothesisRead(HypothesisBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def handle_orm_obj(cls, data: Any) -> Any:
        if hasattr(data, "id") and not isinstance(data, dict):
            return {
                "id": getattr(data, "id", None),
                "workspace_id": getattr(data, "workspace_id", None),
                "code": getattr(data, "code", ""),
                "statement": getattr(data, "statement", ""),
                "rationale": getattr(data, "rationale", None),
                "expected_outcome": getattr(data, "expected_outcome", None),
                "status": getattr(data, "status", "draft"),
                "confidence_score": getattr(data, "confidence_score", 1.0),
                "metadata": getattr(data, "metadata_json", {}) or {},
                "created_by": getattr(data, "created_by", None),
                "created_at": getattr(data, "created_at", None),
                "updated_at": getattr(data, "updated_at", None),
            }
        return data
