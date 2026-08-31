import uuid
from typing import List, Optional, Dict
from sqlalchemy import select, or_
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
from app.schemas.search_and_timeline import SearchResultItem, GlobalSearchResponse


class SearchService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search(
        self,
        workspace_id: uuid.UUID,
        query: str,
        type_filter: Optional[str] = None,
        limit: int = 50,
    ) -> GlobalSearchResponse:
        clean_q = query.strip()
        pattern = f"%{clean_q}%"
        items: List[SearchResultItem] = []
        counts: Dict[str, int] = {}

        if not clean_q:
            return GlobalSearchResponse(
                query=query,
                total_results=0,
                results_by_type={},
                items=[],
            )

        # 1. Questions
        if not type_filter or type_filter == "question":
            q_res = await self.db.execute(
                select(ResearchQuestion).where(
                    ResearchQuestion.workspace_id == workspace_id,
                    or_(
                        ResearchQuestion.title.ilike(pattern),
                        ResearchQuestion.description.ilike(pattern),
                        ResearchQuestion.code.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in q_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.code,
                    type="question",
                    title=row.title,
                    snippet=row.description or "",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 2. Papers
        if not type_filter or type_filter == "paper":
            p_res = await self.db.execute(
                select(Paper).where(
                    Paper.workspace_id == workspace_id,
                    or_(
                        Paper.title.ilike(pattern),
                        Paper.abstract.ilike(pattern),
                        Paper.code.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in p_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.code,
                    type="paper",
                    title=row.title,
                    snippet=row.abstract or "",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 3. Evidence
        if not type_filter or type_filter == "evidence":
            ev_res = await self.db.execute(
                select(Evidence).where(
                    Evidence.workspace_id == workspace_id,
                    or_(
                        Evidence.title.ilike(pattern),
                        Evidence.summary.ilike(pattern),
                        Evidence.code.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in ev_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.code,
                    type="evidence",
                    title=row.title,
                    snippet=row.summary or "",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 4. Datasets
        if not type_filter or type_filter == "dataset":
            d_res = await self.db.execute(
                select(Dataset).where(
                    Dataset.workspace_id == workspace_id,
                    or_(
                        Dataset.name.ilike(pattern),
                        Dataset.description.ilike(pattern),
                        Dataset.slug.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in d_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.slug,
                    type="dataset",
                    title=row.name,
                    snippet=row.description or f"Modality: {row.modality}",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 5. Models
        if not type_filter or type_filter == "model":
            m_res = await self.db.execute(
                select(ModelRegistry).where(
                    ModelRegistry.workspace_id == workspace_id,
                    or_(
                        ModelRegistry.name.ilike(pattern),
                        ModelRegistry.description.ilike(pattern),
                        ModelRegistry.architecture.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in m_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.slug,
                    type="model",
                    title=row.name,
                    snippet=row.description or f"Architecture: {row.architecture}",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 6. Gaps
        if not type_filter or type_filter == "gap":
            g_res = await self.db.execute(
                select(Gap).where(
                    Gap.workspace_id == workspace_id,
                    or_(
                        Gap.title.ilike(pattern),
                        Gap.description.ilike(pattern),
                        Gap.code.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in g_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.code,
                    type="gap",
                    title=row.title,
                    snippet=row.description or "",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 7. Hypotheses
        if not type_filter or type_filter == "hypothesis":
            h_res = await self.db.execute(
                select(Hypothesis).where(
                    Hypothesis.workspace_id == workspace_id,
                    or_(
                        Hypothesis.statement.ilike(pattern),
                        Hypothesis.rationale.ilike(pattern),
                        Hypothesis.code.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in h_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.code,
                    type="hypothesis",
                    title=row.statement,
                    snippet=row.rationale or "",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 8. Experiments
        if not type_filter or type_filter == "experiment":
            e_res = await self.db.execute(
                select(Experiment).where(
                    Experiment.workspace_id == workspace_id,
                    or_(
                        Experiment.title.ilike(pattern),
                        Experiment.description.ilike(pattern),
                        Experiment.code.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in e_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.code,
                    type="experiment",
                    title=row.title,
                    snippet=row.description or "",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 9. Results
        if not type_filter or type_filter == "result":
            r_res = await self.db.execute(
                select(Result).where(
                    Result.workspace_id == workspace_id,
                    or_(
                        Result.title.ilike(pattern),
                        Result.summary.ilike(pattern),
                        Result.code.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in r_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.code,
                    type="result",
                    title=row.title,
                    snippet=row.summary or "",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 10. Decisions
        if not type_filter or type_filter == "decision":
            dec_res = await self.db.execute(
                select(Decision).where(
                    Decision.workspace_id == workspace_id,
                    or_(
                        Decision.title.ilike(pattern),
                        Decision.rationale.ilike(pattern),
                        Decision.code.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in dec_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.code,
                    type="decision",
                    title=row.title,
                    snippet=row.rationale or "",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # 11. Claims
        if not type_filter or type_filter == "claim":
            cl_res = await self.db.execute(
                select(Claim).where(
                    Claim.workspace_id == workspace_id,
                    or_(
                        Claim.statement.ilike(pattern),
                        Claim.code.ilike(pattern),
                    ),
                ).limit(limit)
            )
            for row in cl_res.scalars().all():
                items.append(SearchResultItem(
                    id=row.id,
                    code=row.code,
                    type="claim",
                    title=row.statement,
                    snippet=f"Confidence: {row.confidence_score * 100:.0f}%" if row.confidence_score <= 1.0 else f"Confidence: {row.confidence_score:.0f}%",
                    created_at=row.created_at,
                    metadata=row.metadata_json or {},
                ))

        # Compute breakdown by type
        for item in items:
            counts[item.type] = counts.get(item.type, 0) + 1

        # Sort results by creation date descending
        items.sort(key=lambda x: x.created_at, reverse=True)

        return GlobalSearchResponse(
            query=query,
            total_results=len(items),
            results_by_type=counts,
            items=items[:limit],
        )
