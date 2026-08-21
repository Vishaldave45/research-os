import uuid
from typing import Any, Dict
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import TimeStampedUUIDModel


class Experiment(TimeStampedUUIDModel):
    __tablename__ = "experiments"

    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(32), nullable=False)  # e.g., 'E-001'
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="planned", nullable=False)  # 'planned', 'running', 'completed', 'failed', 'aborted'
    config: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)  # hyperparameters, model, seed, dataset, etc.
    execution_metadata: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)  # compute platform, run_id, duration, logs
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
