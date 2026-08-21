import uuid
import re
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Project name")
    research_area: Optional[str] = Field(None, max_length=255, description="Research area / domain e.g. Medical AI")
    description: Optional[str] = Field(None, description="Detailed scientific overview of the project line")
    status: str = Field("active", pattern=r"^(active|completed|archived)$")


class ProjectCreate(ProjectBase):
    slug: Optional[str] = Field(None, max_length=255)

    @field_validator("slug", mode="before")
    @classmethod
    def generate_slug(cls, v: Optional[str], info) -> Optional[str]:
        if v and v.strip():
            return re.sub(r"[^a-z0-9]+", "-", v.lower().strip()).strip("-")
        return None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    research_area: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(active|completed|archived)$")


class ProjectSummary(BaseModel):
    questions_count: int = 0
    papers_count: int = 0
    gaps_count: int = 0
    hypotheses_count: int = 0
    experiments_count: int = 0
    results_count: int = 0
    decisions_count: int = 0
    claims_count: int = 0


class ProjectRead(ProjectBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    slug: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime
    summary: Optional[ProjectSummary] = None

    model_config = ConfigDict(from_attributes=True)
