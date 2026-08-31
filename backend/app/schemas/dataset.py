import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class DatasetBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Dataset title (e.g. Kvasir-Capsule)")
    version: str = Field("1.0.0", description="Semantic dataset version")
    modality: str = Field("image", description="image, tabular, text, audio, multimodal")
    description: Optional[str] = None
    source_url: Optional[str] = None
    license: Optional[str] = None
    sample_count: Optional[int] = None
    size_bytes: Optional[int] = None
    preprocessing_spec: Dict[str, Any] = Field(default_factory=dict)
    split_spec: Dict[str, Any] = Field(default_factory=dict)
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class DatasetCreate(DatasetBase):
    pass


class DatasetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    version: Optional[str] = None
    modality: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[str] = None
    license: Optional[str] = None
    sample_count: Optional[int] = None
    size_bytes: Optional[int] = None
    preprocessing_spec: Optional[Dict[str, Any]] = None
    split_spec: Optional[Dict[str, Any]] = None
    metadata_json: Optional[Dict[str, Any]] = None


class DatasetRead(DatasetBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    slug: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
