import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Workspace name")
    description: Optional[str] = Field(None, max_length=2000, description="Workspace description")


class WorkspaceCreate(WorkspaceBase):
    slug: Optional[str] = Field(None, min_length=2, max_length=255, pattern=r"^[a-z0-9-]+$", description="URL-friendly slug (auto-generated if omitted)")


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None


class WorkspaceMemberRead(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    user_id: uuid.UUID
    role: str  # 'owner', 'researcher', 'reviewer'
    user_email: str
    user_full_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkspaceMemberInvite(BaseModel):
    email: str
    role: str = Field("researcher", pattern=r"^(owner|researcher|reviewer)$")


class WorkspaceRead(WorkspaceBase):
    id: uuid.UUID
    slug: str
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    current_user_role: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class WorkspaceDetail(WorkspaceRead):
    members: List[WorkspaceMemberRead] = []
