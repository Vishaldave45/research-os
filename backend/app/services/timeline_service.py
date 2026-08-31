import uuid
from typing import List, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.research_question import ResearchQuestion
from app.models.paper import Paper
from app.models.evidence import Evidence
from app.models.dataset import Dataset
from app.models.model_registry import ModelRegistry
from app.models.gap import Gap
from app.models.hypothesis import Hypothesis
from app.models.experiment import Experiment
from app.models.result import Result
from app.models.decision import Decision
from app.models.claim import Claim
from app.models.relationship import Relationship
from app.schemas.search_and_timeline import TimelineEventItem, TimelineResponse


class TimelineService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_timeline(self, workspace_id: uuid.UUID) -> TimelineResponse:
        events: List[TimelineEventItem] = []

        # 1. Fetch relationships to build upstream / downstream adjacency
        rel_res = await self.db.execute(
            select(Relationship).where(Relationship.workspace_id == workspace_id)
        )
        relationships = rel_res.scalars().all()

        upstream_map: Dict[uuid.UUID, List[str]] = {}
        downstream_map: Dict[uuid.UUID, List[str]] = {}

        # 2. Fetch all entity records
        q_res = await self.db.execute(select(ResearchQuestion).where(ResearchQuestion.workspace_id == workspace_id))
        questions = q_res.scalars().all()

        p_res = await self.db.execute(select(Paper).where(Paper.workspace_id == workspace_id))
        papers = p_res.scalars().all()

        ev_res = await self.db.execute(select(Evidence).where(Evidence.workspace_id == workspace_id))
        evidence_items = ev_res.scalars().all()

        d_res = await self.db.execute(select(Dataset).where(Dataset.workspace_id == workspace_id))
        datasets = d_res.scalars().all()

        m_res = await self.db.execute(select(ModelRegistry).where(ModelRegistry.workspace_id == workspace_id))
        models = m_res.scalars().all()

        g_res = await self.db.execute(select(Gap).where(Gap.workspace_id == workspace_id))
        gaps = g_res.scalars().all()

        h_res = await self.db.execute(select(Hypothesis).where(Hypothesis.workspace_id == workspace_id))
        hypotheses = h_res.scalars().all()

        e_res = await self.db.execute(select(Experiment).where(Experiment.workspace_id == workspace_id))
        experiments = e_res.scalars().all()

        r_res = await self.db.execute(select(Result).where(Result.workspace_id == workspace_id))
        results = r_res.scalars().all()

        dec_res = await self.db.execute(select(Decision).where(Decision.workspace_id == workspace_id))
        decisions = dec_res.scalars().all()

        cl_res = await self.db.execute(select(Claim).where(Claim.workspace_id == workspace_id))
        claims = cl_res.scalars().all()

        # Build ID-to-Code mapping
        id_to_code: Dict[uuid.UUID, str] = {}
        for q in questions: id_to_code[q.id] = q.code
        for p in papers: id_to_code[p.id] = p.code
        for ev in evidence_items: id_to_code[ev.id] = ev.code
        for d in datasets: id_to_code[d.id] = d.slug
        for m in models: id_to_code[m.id] = m.slug
        for g in gaps: id_to_code[g.id] = g.code
        for h in hypotheses: id_to_code[h.id] = h.code
        for e in experiments: id_to_code[e.id] = e.code
        for r in results: id_to_code[r.id] = r.code
        for dec in decisions: id_to_code[dec.id] = dec.code
        for cl in claims: id_to_code[cl.id] = cl.code

        for rel in relationships:
            src_code = id_to_code.get(rel.source_id, str(rel.source_id)[:8])
            tgt_code = id_to_code.get(rel.target_id, str(rel.target_id)[:8])

            downstream_map.setdefault(rel.source_id, []).append(tgt_code)
            upstream_map.setdefault(rel.target_id, []).append(src_code)

        # 3. Create Timeline Event Items
        for q in questions:
            events.append(TimelineEventItem(
                id=q.id,
                code=q.code,
                entity_type="question",
                event_type="inquired",
                title=f"Inquiry Formulated: {q.title}",
                summary=q.description,
                timestamp=q.created_at,
                author_id=q.created_by,
                upstream_codes=upstream_map.get(q.id, []),
                downstream_codes=downstream_map.get(q.id, []),
                metadata={"priority": q.priority, "status": q.status},
            ))

        for p in papers:
            events.append(TimelineEventItem(
                id=p.id,
                code=p.code,
                entity_type="paper",
                event_type="reviewed",
                title=f"Literature Synthesized: {p.title}",
                summary=p.abstract,
                timestamp=p.created_at,
                author_id=p.created_by,
                upstream_codes=upstream_map.get(p.id, []),
                downstream_codes=downstream_map.get(p.id, []),
                metadata={"authors": p.authors, "year": p.year},
            ))

        for ev in evidence_items:
            events.append(TimelineEventItem(
                id=ev.id,
                code=ev.code,
                entity_type="evidence",
                event_type="recorded",
                title=f"Evidence Grounded: {ev.title}",
                summary=ev.summary,
                timestamp=ev.created_at,
                author_id=ev.created_by,
                upstream_codes=upstream_map.get(ev.id, []),
                downstream_codes=downstream_map.get(ev.id, []),
                metadata={"type": ev.evidence_type, "strength": ev.strength},
            ))

        for d in datasets:
            events.append(TimelineEventItem(
                id=d.id,
                code=d.slug,
                entity_type="dataset",
                event_type="registered",
                title=f"Dataset Registered: {d.name} (v{d.version})",
                summary=d.description or f"Modality: {d.modality}",
                timestamp=d.created_at,
                author_id=d.created_by,
                upstream_codes=upstream_map.get(d.id, []),
                downstream_codes=downstream_map.get(d.id, []),
                metadata={"modality": d.modality, "samples": d.sample_count},
            ))

        for m in models:
            events.append(TimelineEventItem(
                id=m.id,
                code=m.slug,
                entity_type="model",
                event_type="registered",
                title=f"Model Architecture Logged: {m.name} ({m.architecture})",
                summary=m.description or f"Framework: {m.framework}",
                timestamp=m.created_at,
                author_id=m.created_by,
                upstream_codes=upstream_map.get(m.id, []),
                downstream_codes=downstream_map.get(m.id, []),
                metadata={"architecture": m.architecture, "framework": m.framework},
            ))

        for g in gaps:
            events.append(TimelineEventItem(
                id=g.id,
                code=g.code,
                entity_type="gap",
                event_type="discovered",
                title=f"Research Gap Identified: {g.title}",
                summary=g.description,
                timestamp=g.created_at,
                author_id=g.created_by,
                upstream_codes=upstream_map.get(g.id, []),
                downstream_codes=downstream_map.get(g.id, []),
                metadata={"impact_level": g.impact_level},
            ))

        for h in hypotheses:
            events.append(TimelineEventItem(
                id=h.id,
                code=h.code,
                entity_type="hypothesis",
                event_type="hypothesized",
                title=f"Hypothesis Formulated: {h.statement}",
                summary=h.rationale,
                timestamp=h.created_at,
                author_id=h.created_by,
                upstream_codes=upstream_map.get(h.id, []),
                downstream_codes=downstream_map.get(h.id, []),
                metadata={"confidence": h.confidence, "status": h.status},
            ))

        for e in experiments:
            events.append(TimelineEventItem(
                id=e.id,
                code=e.code,
                entity_type="experiment",
                event_type="executed",
                title=f"Protocol Executed: {e.title}",
                summary=e.description,
                timestamp=e.created_at,
                author_id=e.created_by,
                upstream_codes=upstream_map.get(e.id, []),
                downstream_codes=downstream_map.get(e.id, []),
                metadata={"status": e.status},
            ))

        for r in results:
            events.append(TimelineEventItem(
                id=r.id,
                code=r.code,
                entity_type="result",
                event_type="quantified",
                title=f"Result Measured: {r.title}",
                summary=r.summary,
                timestamp=r.created_at,
                author_id=r.created_by,
                upstream_codes=upstream_map.get(r.id, []),
                downstream_codes=downstream_map.get(r.id, []),
                metadata={"metrics": r.metrics_json},
            ))

        for dec in decisions:
            events.append(TimelineEventItem(
                id=dec.id,
                code=dec.code,
                entity_type="decision",
                event_type="decided",
                title=f"Architectural Verdict: {dec.title}",
                summary=dec.rationale,
                timestamp=dec.created_at,
                author_id=dec.created_by,
                upstream_codes=upstream_map.get(dec.id, []),
                downstream_codes=downstream_map.get(dec.id, []),
                metadata={"outcome": dec.outcome},
            ))

        for cl in claims:
            events.append(TimelineEventItem(
                id=cl.id,
                code=cl.code,
                entity_type="claim",
                event_type="claimed",
                title=f"Grounded Assertion: {cl.statement}",
                summary=f"Confidence: {cl.confidence_score * 100:.0f}%" if cl.confidence_score <= 1.0 else f"Confidence: {cl.confidence_score:.0f}%",
                timestamp=cl.created_at,
                author_id=cl.created_by,
                upstream_codes=upstream_map.get(cl.id, []),
                downstream_codes=downstream_map.get(cl.id, []),
                metadata={"confidence": cl.confidence_score, "status": cl.status},
            ))

        # Sort chronologically (oldest to newest for research timeline reconstruction)
        events.sort(key=lambda x: x.timestamp)

        return TimelineResponse(
            workspace_id=workspace_id,
            total_events=len(events),
            events=events,
        )
