import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ExperimentBase(BaseModel):
    code: Optional[str] = Field(None, max_length=32, description="Unique code e.g. E-001")
    title: str = Field(..., min_length=3, description="Descriptive experiment title")
    description: Optional[str] = None
    status: str = Field("planned", pattern=r"^(planned|running|completed|failed|aborted)$")
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Configuration metadata: hyperparameters, architecture, seed, dataset splits, learning rate, batch size, etc.",
    )
    execution_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Execution platform info: provider, run_id, duration_seconds, compute_type, commit_hash, etc.",
    )


class ExperimentCreate(ExperimentBase):
    linked_hypothesis_ids: List[uuid.UUID] = Field(
        default_factory=list,
        description="Hypotheses this empirical experiment directly tests",
    )


class ExperimentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(planned|running|completed|failed|aborted)$")
    config: Optional[Dict[str, Any]] = None
    execution_metadata: Optional[Dict[str, Any]] = None


class ExperimentRead(ExperimentBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResultBase(BaseModel):
    code: Optional[str] = Field(None, max_length=32, description="Unique code e.g. R-001")
    title: str = Field(..., min_length=3, description="Result title")
    summary: str = Field(..., min_length=5, description="Executive analytical summary of findings")
    metrics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Quantitative key-value metrics: e.g. {'accuracy': 0.942, 'flops_reduction': '64%', 'latency_ms': 11.2}",
    )
    artifacts: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Artifact records: e.g. [{'type': 'confusion_matrix', 'url': '...', 'description': '...'}]",
    )
    status: str = Field("valid", pattern=r"^(valid|inconclusive|invalid)$")


class ResultCreate(ResultBase):
    experiment_id: uuid.UUID = Field(..., description="The parent experiment that yielded this result")
    linked_hypothesis_ids: List[uuid.UUID] = Field(
        default_factory=list,
        description="Hypotheses this result directly supports or refutes",
    )


class ResultUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    summary: Optional[str] = Field(None, min_length=5)
    metrics: Optional[Dict[str, Any]] = None
    artifacts: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = Field(None, pattern=r"^(valid|inconclusive|invalid)$")


class ResultRead(ResultBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
