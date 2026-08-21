import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.experiment import Experiment
from app.models.result import Result
from app.models.claim import Claim
from app.models.relationship import Relationship
from app.schemas.experiment_and_result import (
    ExperimentCreate,
    ExperimentRead,
    ResultCreate,
    ResultRead,
)
from app.schemas.claim import (
    ClaimCreate,
    ClaimRead,
)
from app.repositories.experiment_and_claim_repository import (
    ExperimentRepository,
    ResultRepository,
    ClaimRepository,
)
from app.repositories.gap_and_hypothesis_repository import HypothesisRepository
from app.repositories.research_question_and_paper_repository import PaperRepository


class ExperimentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.experiment_repo = ExperimentRepository(db)
        self.hypothesis_repo = HypothesisRepository(db)

    async def create_experiment(
        self,
        experiment_in: ExperimentCreate,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ExperimentRead:
        code = experiment_in.code or await self.experiment_repo.get_next_code(workspace_id)

        experiment = Experiment(
            workspace_id=workspace_id,
            code=code,
            title=experiment_in.title.strip(),
            description=experiment_in.description.strip() if experiment_in.description else None,
            status=experiment_in.status,
            config_json=experiment_in.config,
            execution_metadata_json=experiment_in.execution_metadata,
            created_by=user_id,
        )
        created = await self.experiment_repo.create(experiment)

        # Link to hypotheses (experiment tests hypothesis)
        for h_id in experiment_in.linked_hypothesis_ids:
            h = await self.hypothesis_repo.get_by_id(h_id, workspace_id)
            if h:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="experiment",
                    source_id=created.id,
                    target_type="hypothesis",
                    target_id=h.id,
                    relation_type="tests",
                    created_by=user_id,
                )
                self.db.add(rel)

        return ExperimentRead.model_validate(created)

    async def list_experiments(
        self,
        workspace_id: uuid.UUID,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ExperimentRead]:
        items = await self.experiment_repo.list(workspace_id, status=status_filter, search=search)
        return [ExperimentRead.model_validate(item) for item in items]

    async def get_experiment(self, experiment_id: uuid.UUID, workspace_id: uuid.UUID) -> ExperimentRead:
        item = await self.experiment_repo.get_by_id(experiment_id, workspace_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experiment not found.",
            )
        return ExperimentRead.model_validate(item)


class ResultService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.result_repo = ResultRepository(db)
        self.experiment_repo = ExperimentRepository(db)
        self.hypothesis_repo = HypothesisRepository(db)

    async def create_result(
        self,
        result_in: ResultCreate,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ResultRead:
        # Verify parent experiment exists in this workspace
        exp = await self.experiment_repo.get_by_id(result_in.experiment_id, workspace_id)
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent experiment not found in this workspace.",
            )

        code = result_in.code or await self.result_repo.get_next_code(workspace_id)

        result_entity = Result(
            workspace_id=workspace_id,
            experiment_id=result_in.experiment_id,
            code=code,
            title=result_in.title.strip(),
            summary=result_in.summary.strip(),
            metrics_json=result_in.metrics,
            artifacts_json=result_in.artifacts,
            status=result_in.status,
            created_by=user_id,
        )
        created = await self.result_repo.create(result_entity)

        # Link to hypotheses (result supports or refutes hypothesis)
        for h_id in result_in.linked_hypothesis_ids:
            h = await self.hypothesis_repo.get_by_id(h_id, workspace_id)
            if h:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="result",
                    source_id=created.id,
                    target_type="hypothesis",
                    target_id=h.id,
                    relation_type="supports" if result_in.status == "valid" else "refutes",
                    created_by=user_id,
                )
                self.db.add(rel)

        return ResultRead.model_validate(created)

    async def list_results(
        self,
        workspace_id: uuid.UUID,
        experiment_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ResultRead]:
        items = await self.result_repo.list(
            workspace_id,
            experiment_id=experiment_id,
            status=status_filter,
            search=search,
        )
        return [ResultRead.model_validate(item) for item in items]

    async def get_result(self, result_id: uuid.UUID, workspace_id: uuid.UUID) -> ResultRead:
        item = await self.result_repo.get_by_id(result_id, workspace_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Result not found.",
            )
        return ResultRead.model_validate(item)


class ClaimService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.claim_repo = ClaimRepository(db)
        self.hypothesis_repo = HypothesisRepository(db)
        self.result_repo = ResultRepository(db)
        self.paper_repo = PaperRepository(db)

    async def create_claim(
        self,
        claim_in: ClaimCreate,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ClaimRead:
        code = claim_in.code or await self.claim_repo.get_next_code(workspace_id)

        claim = Claim(
            workspace_id=workspace_id,
            code=code,
            statement=claim_in.statement.strip(),
            confidence_score=claim_in.confidence_score,
            status=claim_in.status,
            metadata_json=claim_in.metadata,
            created_by=user_id,
        )
        created = await self.claim_repo.create(claim)

        # Link to hypotheses (claim derived_from hypothesis)
        for h_id in claim_in.linked_hypothesis_ids:
            h = await self.hypothesis_repo.get_by_id(h_id, workspace_id)
            if h:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="claim",
                    source_id=created.id,
                    target_type="hypothesis",
                    target_id=h.id,
                    relation_type="derived_from",
                    created_by=user_id,
                )
                self.db.add(rel)

        # Link to results (result supports claim)
        for r_id in claim_in.linked_result_ids:
            r = await self.result_repo.get_by_id(r_id, workspace_id)
            if r:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="result",
                    source_id=r.id,
                    target_type="claim",
                    target_id=created.id,
                    relation_type="supports",
                    created_by=user_id,
                )
                self.db.add(rel)

        # Link to papers (paper cites/corroborates claim)
        for p_id in claim_in.linked_paper_ids:
            p = await self.paper_repo.get_by_id(p_id, workspace_id)
            if p:
                rel = Relationship(
                    workspace_id=workspace_id,
                    source_type="paper",
                    source_id=p.id,
                    target_type="claim",
                    target_id=created.id,
                    relation_type="cites",
                    created_by=user_id,
                )
                self.db.add(rel)

        return ClaimRead.model_validate(created)

    async def list_claims(
        self,
        workspace_id: uuid.UUID,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ClaimRead]:
        items = await self.claim_repo.list(workspace_id, status=status_filter, search=search)
        return [ClaimRead.model_validate(item) for item in items]

    async def get_claim(self, claim_id: uuid.UUID, workspace_id: uuid.UUID) -> ClaimRead:
        item = await self.claim_repo.get_by_id(claim_id, workspace_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Claim not found.",
            )
        return ClaimRead.model_validate(item)
