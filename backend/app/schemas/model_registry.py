import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ModelBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Model variant name (e.g. SegResNet-DepthReduced-v2)")
    version: str = Field("1.0.0", description="Semantic model version")
    architecture: str = Field(..., min_length=2, max_length=100, description="Base architecture family")
    framework: str = Field("pytorch", description="pytorch, tensorflow, jax, onnx")
    parameter_count: Optional[int] = None
    checkpoint_url: Optional[str] = None
    code_commit_hash: Optional[str] = None
    description: Optional[str] = None
    hyperparameters: Dict[str, Any] = Field(default_factory=dict)
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class ModelCreate(ModelBase):
    pass


class ModelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    version: Optional[str] = None
    architecture: Optional[str] = None
    framework: Optional[str] = None
    parameter_count: Optional[int] = None
    checkpoint_url: Optional[str] = None
    code_commit_hash: Optional[str] = None
    description: Optional[str] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    metadata_json: Optional[Dict[str, Any]] = None


class ModelRead(ModelBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    slug: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
