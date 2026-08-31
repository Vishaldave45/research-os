"""add datasets and models tables

Revision ID: b2e4f0a3c5d6
Revises: a1d3f9e2b4c5
Create Date: 2026-08-31 15:42:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b2e4f0a3c5d6'
down_revision: Union[str, None] = 'a1d3f9e2b4c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create datasets table
    op.create_table(
        'datasets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('workspace_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False, server_default='1.0.0'),
        sa.Column('modality', sa.String(length=50), nullable=False, server_default='image'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('source_url', sa.String(length=512), nullable=True),
        sa.Column('license', sa.String(length=100), nullable=True),
        sa.Column('sample_count', sa.Integer(), nullable=True),
        sa.Column('size_bytes', sa.BigInteger(), nullable=True),
        sa.Column('preprocessing_spec', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('split_spec', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_datasets_workspace_id', 'datasets', ['workspace_id'], unique=False)
    op.create_index('ix_datasets_workspace_slug', 'datasets', ['workspace_id', 'slug'], unique=True)
    op.create_index('ix_datasets_modality', 'datasets', ['workspace_id', 'modality'], unique=False)

    # 2. Create model_registry table
    op.create_table(
        'model_registry',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('workspace_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('workspaces.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False, server_default='1.0.0'),
        sa.Column('architecture', sa.String(length=100), nullable=False),
        sa.Column('framework', sa.String(length=50), nullable=False, server_default='pytorch'),
        sa.Column('parameter_count', sa.BigInteger(), nullable=True),
        sa.Column('checkpoint_url', sa.String(length=512), nullable=True),
        sa.Column('code_commit_hash', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('hyperparameters', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    op.create_index('ix_models_workspace_id', 'model_registry', ['workspace_id'], unique=False)
    op.create_index('ix_models_workspace_slug', 'model_registry', ['workspace_id', 'slug'], unique=True)
    op.create_index('ix_models_architecture', 'model_registry', ['workspace_id', 'architecture'], unique=False)


def downgrade() -> None:
    op.drop_table('model_registry')
    op.drop_table('datasets')
