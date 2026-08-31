import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class DomainBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Domain name (e.g. Medical AI)")
    description: Optional[str] = Field(None, description="Detailed domain overview and scope")
    color_badge: str = Field("blue", description="UI badge color token (blue, emerald, purple, amber, rose)")
    icon: str = Field("Layers", description="Lucide icon identifier")
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class DomainCreate(DomainBase):
    pass


class DomainUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    color_badge: Optional[str] = None
    icon: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None


class DomainRead(DomainBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    slug: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime
    project_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
