import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, BigInteger, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ModelRegistry(Base):
    """
    Model Registry Entity:
    Tracks deep learning architectures, checkpoints, parameters, and code commit provenance.
    """
    __tablename__ = "model_registry"
    __table_args__ = (
        Index("ix_models_workspace_slug", "workspace_id", "slug", unique=True),
        Index("ix_models_workspace_id", "workspace_id"),
        Index("ix_models_architecture", "workspace_id", "architecture"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)
    architecture: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., 'SegResNet', 'ResNet-50', 'Llama-3-8B'
    framework: Mapped[str] = mapped_column(String(50), default="pytorch", nullable=False)  # pytorch, tensorflow, jax, onnx
    
    parameter_count: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    checkpoint_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    code_commit_hash: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    hyperparameters: Mapped[Dict[str, Any]] = mapped_column("hyperparameters", JSONB, default=dict, nullable=False)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    workspace = relationship("Workspace", backref="models")
