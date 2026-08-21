import uuid
from typing import Any, Dict, List
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import TimeStampedUUIDModel


class Result(TimeStampedUUIDModel):
    __tablename__ = "results"

    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(32), nullable=False)  # e.g., 'R-001'
    title: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    metrics: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)  # accuracy, precision, recall, FLOPs, latency, etc.
    artifacts: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list, nullable=False)  # links to figures, Drive paths, weights
    status: Mapped[str] = mapped_column(String(50), default="valid", nullable=False)  # 'valid', 'inconclusive', 'invalid'
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
