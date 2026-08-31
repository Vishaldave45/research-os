import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.research_question import ResearchQuestion
from app.models.paper import Paper
from app.models.gap import Gap
from app.models.hypothesis import Hypothesis
from app.models.experiment import Experiment
from app.models.result import Result
from app.models.decision import Decision
from app.models.claim import Claim

class GraphContextBuilder:
    """Builds authorized research context directly from PostgreSQL."""
    def __init__(self, db: AsyncSession, workspace_id: uuid.UUID):
        self.db = db
        self.workspace_id = workspace_id

    async def build_full_context(self) -> str:
        """Serializes current DAG entities into dense research markdown context."""
        # 1. Questions
        q_res = await self.db.execute(select(ResearchQuestion).where(ResearchQuestion.workspace_id == self.workspace_id))
        questions = q_res.scalars().all()

        # 2. Papers
        p_res = await self.db.execute(select(Paper).where(Paper.workspace_id == self.workspace_id))
        papers = p_res.scalars().all()

        # 3. Gaps
        g_res = await self.db.execute(select(Gap).where(Gap.workspace_id == self.workspace_id))
        gaps = g_res.scalars().all()

        # 4. Hypotheses
        h_res = await self.db.execute(select(Hypothesis).where(Hypothesis.workspace_id == self.workspace_id))
        hypotheses = h_res.scalars().all()

        # 5. Results
        r_res = await self.db.execute(select(Result).where(Result.workspace_id == self.workspace_id))
        results = r_res.scalars().all()

        # 6. Decisions
        d_res = await self.db.execute(select(Decision).where(Decision.workspace_id == self.workspace_id))
        decisions = d_res.scalars().all()

        lines = ["# Active Research Knowledge Graph Context\n"]
        
        if questions:
            lines.append("## Research Inquiries:")
            for q in questions:
                lines.append(f"- [{q.code}] {q.title}")
        
        if papers:
            lines.append("\n## Literature Citations:")
            for p in papers:
                lines.append(f"- [{p.code}] {p.title} ({p.year}) - {p.venue}")
        
        if gaps:
            lines.append("\n## Literature Gaps:")
            for g in gaps:
                lines.append(f"- [{g.code}] {g.title}: {g.description}")
        
        if hypotheses:
            lines.append("\n## Testable Hypotheses:")
            for h in hypotheses:
                lines.append(f"- [{h.code}] Statement: {h.statement} (Status: {h.status})")

        if results:
            lines.append("\n## Empirical Results:")
            for r in results:
                lines.append(f"- [{r.code}] {r.title}: {r.summary} Metrics: {r.metrics}")

        if decisions:
            lines.append("\n## Architectural & Scientific Decisions:")
            for d in decisions:
                lines.append(f"- [{d.code}] {d.title} (Outcome: {d.outcome})")

        return "\n".join(lines)
