import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class DecisionBase(BaseModel):
    code: Optional[str] = Field(None, max_length=32, description="Unique code e.g. D-001")
    title: str = Field(..., min_length=3, description="Decision statement or architecture change")
    outcome: str = Field(..., pattern=r"^(accepted|rejected|pivoted|deferred)$", description="Resolution outcome")
    rationale: str = Field(..., min_length=10, description="Evidence-backed reasoning justification")
    implications: Optional[str] = Field(None, description="Downstream architectural or scientific implications")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DecisionCreate(DecisionBase):
    linked_result_ids: List[uuid.UUID] = Field(default_factory=list, description="Empirical results supporting this decision")
    linked_hypothesis_ids: List[uuid.UUID] = Field(default_factory=list, description="Hypotheses resolved by this decision")


class DecisionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    outcome: Optional[str] = Field(None, pattern=r"^(accepted|rejected|pivoted|deferred)$")
    rationale: Optional[str] = Field(None, min_length=10)
    implications: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class DecisionRead(DecisionBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
