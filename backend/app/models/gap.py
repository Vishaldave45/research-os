import uuid
from typing import Any, Dict
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import TimeStampedUUIDModel


class Gap(TimeStampedUUIDModel):
    __tablename__ = "gaps"

    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(32), nullable=False)  # e.g., 'G-001'
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    impact_level: Mapped[str] = mapped_column(String(50), default="high", nullable=False)  # 'critical', 'high', 'medium', 'low'
    status: Mapped[str] = mapped_column(String(50), default="open", nullable=False)  # 'open', 'addressed', 'deprecated'
    metadata_json: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
