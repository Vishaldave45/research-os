"""add_performance_composite_indexes

Revision ID: 811195fdbd23
Revises: a1b2c3d4e5f6
Create Date: 2026-08-31 19:15:29.779792

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '811195fdbd23'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Composite indexes for high-throughput workspace-scoped timeline queries
    op.create_index('ix_questions_ws_created', 'research_questions', ['workspace_id', 'created_at'], unique=False)
    op.create_index('ix_questions_ws_status', 'research_questions', ['workspace_id', 'status'], unique=False)

    op.create_index('ix_papers_ws_created', 'papers', ['workspace_id', 'created_at'], unique=False)
    op.create_index('ix_papers_ws_year', 'papers', ['workspace_id', 'year'], unique=False)

    op.create_index('ix_gaps_ws_created', 'gaps', ['workspace_id', 'created_at'], unique=False)
    op.create_index('ix_gaps_ws_status', 'gaps', ['workspace_id', 'status'], unique=False)

    op.create_index('ix_hypotheses_ws_created', 'hypotheses', ['workspace_id', 'created_at'], unique=False)
    op.create_index('ix_hypotheses_ws_status', 'hypotheses', ['workspace_id', 'status'], unique=False)

    op.create_index('ix_experiments_ws_created', 'experiments', ['workspace_id', 'created_at'], unique=False)
    op.create_index('ix_experiments_ws_status', 'experiments', ['workspace_id', 'status'], unique=False)

    op.create_index('ix_results_ws_created', 'results', ['workspace_id', 'created_at'], unique=False)
    op.create_index('ix_results_ws_status', 'results', ['workspace_id', 'status'], unique=False)

    op.create_index('ix_decisions_ws_created', 'decisions', ['workspace_id', 'created_at'], unique=False)
    op.create_index('ix_decisions_ws_outcome', 'decisions', ['workspace_id', 'outcome'], unique=False)

    op.create_index('ix_claims_ws_created', 'claims', ['workspace_id', 'created_at'], unique=False)
    op.create_index('ix_claims_ws_status', 'claims', ['workspace_id', 'status'], unique=False)

    op.create_index('ix_projects_ws_created', 'projects', ['workspace_id', 'created_at'], unique=False)
    op.create_index('ix_projects_ws_status', 'projects', ['workspace_id', 'status'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_projects_ws_status', table_name='projects')
    op.drop_index('ix_projects_ws_created', table_name='projects')

    op.drop_index('ix_claims_ws_status', table_name='claims')
    op.drop_index('ix_claims_ws_created', table_name='claims')

    op.drop_index('ix_decisions_ws_outcome', table_name='decisions')
    op.drop_index('ix_decisions_ws_created', table_name='decisions')

    op.drop_index('ix_results_ws_status', table_name='results')
    op.drop_index('ix_results_ws_created', table_name='results')

    op.drop_index('ix_experiments_ws_status', table_name='experiments')
    op.drop_index('ix_experiments_ws_created', table_name='experiments')

    op.drop_index('ix_hypotheses_ws_status', table_name='hypotheses')
    op.drop_index('ix_hypotheses_ws_created', table_name='hypotheses')

    op.drop_index('ix_gaps_ws_status', table_name='gaps')
    op.drop_index('ix_gaps_ws_created', table_name='gaps')

    op.drop_index('ix_papers_ws_year', table_name='papers')
    op.drop_index('ix_papers_ws_created', table_name='papers')

    op.drop_index('ix_questions_ws_status', table_name='research_questions')
    op.drop_index('ix_questions_ws_created', table_name='research_questions')
