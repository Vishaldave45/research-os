import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# --- Comment Schemas ---
class CommentBase(BaseModel):
    entity_type: str = Field(..., description="Target archetype: question, paper, evidence, hypothesis, etc.")
    entity_id: uuid.UUID = Field(..., description="Target entity ID")
    parent_id: Optional[uuid.UUID] = Field(None, description="Optional parent comment ID for threading")
    content: str = Field(..., min_length=1, description="Comment text body")
    mentions: List[str] = Field(default_factory=list, description="List of mentioned usernames/emails")


class CommentCreate(CommentBase):
    pass


class CommentRead(CommentBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    author_id: uuid.UUID
    author_name: Optional[str] = None
    author_email: Optional[str] = None
    is_resolved: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Review Schemas ---
class ReviewBase(BaseModel):
    entity_type: str = Field(..., description="Target entity type being reviewed")
    entity_id: uuid.UUID = Field(..., description="Target entity ID")
    verdict: str = Field("approved", description="approved, changes_requested, rejected")
    comments: Optional[str] = Field(None, description="Peer review comments and critique")
    confidence_rating: int = Field(5, ge=1, le=5, description="Reviewer confidence rating (1-5)")


class ReviewCreate(ReviewBase):
    pass


class ReviewRead(ReviewBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    reviewer_id: uuid.UUID
    reviewer_name: Optional[str] = None
    reviewer_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Audit Log Schemas ---
class AuditLogRead(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    actor_id: Optional[uuid.UUID] = None
    action: str
    entity_type: str
    entity_id: uuid.UUID
    before_state: Dict[str, Any] = Field(default_factory=dict)
    after_state: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
