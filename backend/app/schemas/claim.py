import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ClaimBase(BaseModel):
    code: Optional[str] = Field(None, max_length=32, description="Unique code e.g. C-001")
    statement: str = Field(..., min_length=10, description="Scientific or empirical claim statement")
    confidence_score: float = Field(
        1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0 to 1.0) derived from evidentiary support",
    )
    status: str = Field("asserted", pattern=r"^(asserted|verified|contested|retracted)$")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ClaimCreate(ClaimBase):
    linked_hypothesis_ids: List[uuid.UUID] = Field(
        default_factory=list,
        description="Hypotheses from which this claim is derived",
    )
    linked_result_ids: List[uuid.UUID] = Field(
        default_factory=list,
        description="Empirical results that support this claim",
    )
    linked_paper_ids: List[uuid.UUID] = Field(
        default_factory=list,
        description="Literature papers that cite or corroborate this claim",
    )


class ClaimUpdate(BaseModel):
    statement: Optional[str] = Field(None, min_length=10)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    status: Optional[str] = Field(None, pattern=r"^(asserted|verified|contested|retracted)$")
    metadata: Optional[Dict[str, Any]] = None


class ClaimRead(ClaimBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
