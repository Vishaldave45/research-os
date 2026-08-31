import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, BigInteger, Integer, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Dataset(Base):
    """
    Dataset Registry Entity:
    Tracks curated research datasets, modalities, preprocessing specs, splits, and links to Experiments.
    """
    __tablename__ = "datasets"
    __table_args__ = (
        Index("ix_datasets_workspace_slug", "workspace_id", "slug", unique=True),
        Index("ix_datasets_workspace_id", "workspace_id"),
        Index("ix_datasets_modality", "workspace_id", "modality"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)
    modality: Mapped[str] = mapped_column(String(50), default="image", nullable=False)  # image, tabular, text, audio, multimodal
    
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    license: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    sample_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    
    preprocessing_spec: Mapped[Dict[str, Any]] = mapped_column("preprocessing_spec", JSONB, default=dict, nullable=False)
    split_spec: Mapped[Dict[str, Any]] = mapped_column("split_spec", JSONB, default=dict, nullable=False)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    workspace = relationship("Workspace", backref="datasets")
