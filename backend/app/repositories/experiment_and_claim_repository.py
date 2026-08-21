import uuid
from typing import Optional, List
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.experiment import Experiment
from app.models.result import Result
from app.models.claim import Claim


class ExperimentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, experiment_id: uuid.UUID, workspace_id: uuid.UUID) -> Optional[Experiment]:
        stmt = select(Experiment).where(
            Experiment.id == experiment_id,
            Experiment.workspace_id == workspace_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_next_code(self, workspace_id: uuid.UUID) -> str:
        stmt = select(func.count(Experiment.id)).where(Experiment.workspace_id == workspace_id)
        result = await self.db.execute(stmt)
        count = result.scalar() or 0
        return f"E-{(count + 1):03d}"

    async def create(self, experiment: Experiment) -> Experiment:
        self.db.add(experiment)
        await self.db.flush()
        await self.db.refresh(experiment)
        return experiment

    async def list(
        self,
        workspace_id: uuid.UUID,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Experiment]:
        stmt = select(Experiment).where(Experiment.workspace_id == workspace_id)
        if status:
            stmt = stmt.where(Experiment.status == status)
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Experiment.title.ilike(search_pattern),
                    Experiment.code.ilike(search_pattern),
                    Experiment.description.ilike(search_pattern),
                )
            )
        stmt = stmt.order_by(Experiment.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())


class ResultRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, result_id: uuid.UUID, workspace_id: uuid.UUID) -> Optional[Result]:
        stmt = select(Result).where(
            Result.id == result_id,
            Result.workspace_id == workspace_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_next_code(self, workspace_id: uuid.UUID) -> str:
        stmt = select(func.count(Result.id)).where(Result.workspace_id == workspace_id)
        result = await self.db.execute(stmt)
        count = result.scalar() or 0
        return f"R-{(count + 1):03d}"

    async def create(self, result: Result) -> Result:
        self.db.add(result)
        await self.db.flush()
        await self.db.refresh(result)
        return result

    async def list(
        self,
        workspace_id: uuid.UUID,
        experiment_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Result]:
        stmt = select(Result).where(Result.workspace_id == workspace_id)
        if experiment_id:
            stmt = stmt.where(Result.experiment_id == experiment_id)
        if status:
            stmt = stmt.where(Result.status == status)
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Result.title.ilike(search_pattern),
                    Result.code.ilike(search_pattern),
                    Result.summary.ilike(search_pattern),
                )
            )
        stmt = stmt.order_by(Result.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())


class ClaimRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, claim_id: uuid.UUID, workspace_id: uuid.UUID) -> Optional[Claim]:
        stmt = select(Claim).where(
            Claim.id == claim_id,
            Claim.workspace_id == workspace_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_next_code(self, workspace_id: uuid.UUID) -> str:
        stmt = select(func.count(Claim.id)).where(Claim.workspace_id == workspace_id)
        result = await self.db.execute(stmt)
        count = result.scalar() or 0
        return f"C-{(count + 1):03d}"

    async def create(self, claim: Claim) -> Claim:
        self.db.add(claim)
        await self.db.flush()
        await self.db.refresh(claim)
        return claim

    async def list(
        self,
        workspace_id: uuid.UUID,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Claim]:
        stmt = select(Claim).where(Claim.workspace_id == workspace_id)
        if status:
            stmt = stmt.where(Claim.status == status)
        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Claim.statement.ilike(search_pattern),
                    Claim.code.ilike(search_pattern),
                )
            )
        stmt = stmt.order_by(Claim.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
