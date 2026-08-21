import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, model_validator


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

    @model_validator(mode="before")
    @classmethod
    def handle_orm_obj(cls, data: Any) -> Any:
        if hasattr(data, "metadata_json"):
            return {
                "id": getattr(data, "id", None),
                "workspace_id": getattr(data, "workspace_id", None),
                "code": getattr(data, "code", ""),
                "title": getattr(data, "title", ""),
                "outcome": getattr(data, "outcome", "accepted"),
                "rationale": getattr(data, "rationale", ""),
                "implications": getattr(data, "implications", None),
                "metadata": getattr(data, "metadata_json", {}) or {},
                "created_by": getattr(data, "created_by", None),
                "created_at": getattr(data, "created_at", None),
                "updated_at": getattr(data, "updated_at", None),
            }
        return data
