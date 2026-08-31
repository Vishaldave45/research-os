"""add_missing_projects_id_index

Revision ID: a1b2c3d4e5f6
Revises: add_collaboration_and_audit_tables
Create Date: 2026-08-31 18:21:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'c3f5a1b4d7e8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index('ix_projects_id', 'projects', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_projects_id', table_name='projects')
