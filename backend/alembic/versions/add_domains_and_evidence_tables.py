"""add domains and evidence tables

Revision ID: a1d3f9e2b4c5
Revises: ff9fe6c37537
Create Date: 2026-08-31 15:33:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1d3f9e2b4c5'
down_revision: Union[str, None] = 'ff9fe6c37537'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create research_domains table
    op.create_table(
        'research_domains',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('workspace_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color_badge', sa.String(length=50), nullable=False, server_default='blue'),
        sa.Column('icon', sa.String(length=50), nullable=False, server_default='Layers'),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_domains_workspace_id', 'research_domains', ['workspace_id'], unique=False)
    op.create_index('ix_domains_workspace_slug', 'research_domains', ['workspace_id', 'slug'], unique=True)

    # 2. Add domain_id column to projects table
    op.add_column('projects', sa.Column('domain_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('research_domains.id', ondelete='SET NULL'), nullable=True))
    op.create_index('ix_projects_domain_id', 'projects', ['domain_id'], unique=False)

    # 3. Create evidence_items table
    op.create_table(
        'evidence_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('workspace_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('evidence_type', sa.String(length=50), nullable=False, server_default='empirical'),
        sa.Column('strength', sa.String(length=50), nullable=False, server_default='moderate'),
        sa.Column('source_type', sa.String(length=50), nullable=False, server_default='paper'),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('citation_doi', sa.String(length=255), nullable=True),
        sa.Column('confidence_score', sa.Integer(), nullable=False, server_default='70'),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_evidence_workspace_id', 'evidence_items', ['workspace_id'], unique=False)
    op.create_index('ix_evidence_workspace_code', 'evidence_items', ['workspace_id', 'code'], unique=True)
    op.create_index('ix_evidence_type', 'evidence_items', ['workspace_id', 'evidence_type'], unique=False)
    op.create_index('ix_evidence_strength', 'evidence_items', ['workspace_id', 'strength'], unique=False)


def downgrade() -> None:
    op.drop_table('evidence_items')
    op.drop_index('ix_projects_domain_id', table_name='projects')
    op.drop_column('projects', 'domain_id')
    op.drop_table('research_domains')
