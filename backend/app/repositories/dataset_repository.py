import uuid
from typing import List, Optional
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dataset import Dataset


class DatasetRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_workspace(
        self,
        workspace_id: uuid.UUID,
        modality: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dataset]:
        query = select(Dataset).where(Dataset.workspace_id == workspace_id)
        if modality:
            query = query.where(Dataset.modality == modality)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Dataset.name.ilike(search_pattern),
                    Dataset.description.ilike(search_pattern),
                    Dataset.slug.ilike(search_pattern),
                )
            )
        query = query.order_by(Dataset.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, dataset_id: uuid.UUID) -> Optional[Dataset]:
        query = select(Dataset).where(Dataset.id == dataset_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_slug(self, workspace_id: uuid.UUID, slug: str) -> Optional[Dataset]:
        query = select(Dataset).where(
            Dataset.workspace_id == workspace_id,
            Dataset.slug == slug,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, dataset: Dataset) -> Dataset:
        self.db.add(dataset)
        await self.db.commit()
        await self.db.refresh(dataset)
        return dataset

    async def update(self, dataset: Dataset) -> Dataset:
        await self.db.commit()
        await self.db.refresh(dataset)
        return dataset

    async def delete(self, dataset: Dataset) -> None:
        await self.db.delete(dataset)
        await self.db.commit()
