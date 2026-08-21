import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ResearchQuestionBase(BaseModel):
    code: Optional[str] = Field(None, max_length=32, description="Unique code e.g. Q-001")
    title: str = Field(..., min_length=5, description="Core research inquiry statement")
    description: Optional[str] = None
    status: str = Field("open", pattern=r"^(open|investigating|answered|closed)$")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ResearchQuestionCreate(ResearchQuestionBase):
    linked_paper_ids: List[uuid.UUID] = Field(default_factory=list, description="Optional initial papers to link")


class ResearchQuestionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(open|investigating|answered|closed)$")
    metadata: Optional[Dict[str, Any]] = None


class ResearchQuestionRead(ResearchQuestionBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaperBase(BaseModel):
    code: Optional[str] = Field(None, max_length=32, description="Unique code e.g. P-001")
    title: str = Field(..., min_length=3, description="Paper title")
    authors: List[str] = Field(default_factory=list, description="Author list")
    year: Optional[int] = Field(None, ge=1800, le=2100)
    venue: Optional[str] = Field(None, max_length=255)
    doi: Optional[str] = Field(None, max_length=255)
    url: Optional[str] = None
    abstract: Optional[str] = None
    notes: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PaperCreate(PaperBase):
    linked_question_ids: List[uuid.UUID] = Field(default_factory=list, description="Questions this paper informs or supports")


class PaperUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    authors: Optional[List[str]] = None
    year: Optional[int] = Field(None, ge=1800, le=2100)
    venue: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    abstract: Optional[str] = None
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class PaperRead(PaperBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    code: str
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
