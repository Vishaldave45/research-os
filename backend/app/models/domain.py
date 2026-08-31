import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Text, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ResearchDomain(Base):
    """
    Research Domain / Topic:
    Provides domain-level scoping within a Workspace (e.g., 'Medical AI', 'NLP / RAG', 'Robotics').
    Workspace -> Research Domain -> Projects.
    """
    __tablename__ = "research_domains"
    __table_args__ = (
        Index("ix_domains_workspace_slug", "workspace_id", "slug", unique=True),
        Index("ix_domains_workspace_id", "workspace_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    color_badge: Mapped[str] = mapped_column(String(50), default="blue", nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="Layers", nullable=False)
    
    metadata_json: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONB, default=dict, nullable=False)
    
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    workspace = relationship("Workspace", backref="research_domains")
    projects = relationship("Project", back_populates="domain")
