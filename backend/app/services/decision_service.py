import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.decision import Decision
from app.models.relationship import Relationship
from app.schemas.decision import DecisionCreate, DecisionRead
from app.repositories.decision_repository import DecisionRepository
from app.repositories.experiment_and_claim_repository import ResultRepository
from app.repositories.gap_and_hypothesis_repository import HypothesisRepository


class DecisionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.decision_repo = DecisionRepository(db)
        self.result_repo = ResultRepository(db)
        self.hypothesis_repo = HypothesisRepository(db)

    async def create_decision(
        self,
        decision_in: DecisionCreate,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> DecisionRead:
        code = decision_in.code or await self.decision_repo.get_next_code(workspace_id)

        decision = Decision(
            workspace_id=workspace_id,
            code=code,
            title=decision_in.title.strip(),
            outcome=decision_in.outcome,
            rationale=decision_in.rationale.strip(),
            implications=decision_in.implications.strip() if decision_in.implications else None,
            metadata_json=decision_in.metadata,
            created_by=user_id,
        )
        created = await self.decision_repo.create(decision)

        # Link to supporting results (result motivates decision)
        for r_id in decision_in.linked_result_ids:
            r = await self.result_repo.get_by_id(r_id, workspace_id)
            if r:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="result",
                    source_id=r.id,
                    target_type="decision",
                    target_id=created.id,
                    relation_type="informs",
                    created_by=user_id,
                )
                self.db.add(rel)

        # Link to hypotheses (decision resolves hypothesis)
        for h_id in decision_in.linked_hypothesis_ids:
            h = await self.hypothesis_repo.get_by_id(h_id, workspace_id)
            if h:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="decision",
                    source_id=created.id,
                    target_type="hypothesis",
                    target_id=h.id,
                    relation_type="addresses",
                    created_by=user_id,
                )
                self.db.add(rel)

        return DecisionRead.model_validate(created)

    async def list_decisions(
        self,
        workspace_id: uuid.UUID,
        outcome_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[DecisionRead]:
        items = await self.decision_repo.list(workspace_id, outcome=outcome_filter, search=search)
        return [DecisionRead.model_validate(item) for item in items]

    async def get_decision(self, decision_id: uuid.UUID, workspace_id: uuid.UUID) -> DecisionRead:
        item = await self.decision_repo.get_by_id(decision_id, workspace_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Decision not found.",
            )
        return DecisionRead.model_validate(item)
