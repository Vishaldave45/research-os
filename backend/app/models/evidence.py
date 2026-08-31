import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Evidence(Base):
    """
    First-Class Evidence Entity:
    Grounds research claims, hypotheses, and questions with empirical results, literature citations, or benchmark evidence.
    """
    __tablename__ = "evidence_items"
    __table_args__ = (
        Index("ix_evidence_workspace_code", "workspace_id", "code", unique=True),
        Index("ix_evidence_workspace_id", "workspace_id"),
        Index("ix_evidence_type", "workspace_id", "evidence_type"),
        Index("ix_evidence_strength", "workspace_id", "strength"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    
    code: Mapped[str] = mapped_column(String(50), nullable=False)  # EV-001, EV-002
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    
    evidence_type: Mapped[str] = mapped_column(String(50), default="empirical", nullable=False)  # empirical, theoretical, benchmark, anecdotal
    strength: Mapped[str] = mapped_column(String(50), default="moderate", nullable=False)  # strong, moderate, weak, inconclusive
    
    source_type: Mapped[str] = mapped_column(String(50), default="paper", nullable=False)  # paper, experiment, result, external_dataset
    source_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    citation_doi: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    confidence_score: Mapped[int] = mapped_column(Integer, default=70, nullable=False)  # 0 - 100
    
    metadata_json: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    workspace = relationship("Workspace", backref="evidence_items")
