import uuid
from datetime import datetime, timezone
from typing import Any, Dict
from sqlalchemy import String, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Relationship(Base):
    """
    The Connective Core of ResearchOS:
    Polymorphic, directed, workspace-scoped reasoning links between any two research entities.
    """
    __tablename__ = "relationships"
    __table_args__ = (
        Index("ix_rel_workspace_source", "workspace_id", "source_type", "source_id"),
        Index("ix_rel_workspace_target", "workspace_id", "target_type", "target_id"),
        Index("ix_rel_workspace_relation", "workspace_id", "relation_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    
    # Source entity
    source_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'question', 'paper', 'gap', 'hypothesis', 'experiment', 'result', 'decision'
    source_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
    # Target entity
    target_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
    # Directed relationship semantics
    relation_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'supports', 'tests', 'derived_from', 'informs', 'cited_by', 'produces', 'motivates', 'contradicts', 'depends_on'
    
    metadata_json: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
