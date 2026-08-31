import uuid
from typing import List, Optional
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.model_registry import ModelRegistry


class ModelRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_by_workspace(
        self,
        workspace_id: uuid.UUID,
        architecture: Optional[str] = None,
        framework: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ModelRegistry]:
        query = select(ModelRegistry).where(ModelRegistry.workspace_id == workspace_id)
        if architecture:
            query = query.where(ModelRegistry.architecture.ilike(f"%{architecture}%"))
        if framework:
            query = query.where(ModelRegistry.framework == framework)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    ModelRegistry.name.ilike(search_pattern),
                    ModelRegistry.description.ilike(search_pattern),
                    ModelRegistry.architecture.ilike(search_pattern),
                    ModelRegistry.slug.ilike(search_pattern),
                )
            )
        query = query.order_by(ModelRegistry.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, model_id: uuid.UUID) -> Optional[ModelRegistry]:
        query = select(ModelRegistry).where(ModelRegistry.id == model_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_slug(self, workspace_id: uuid.UUID, slug: str) -> Optional[ModelRegistry]:
        query = select(ModelRegistry).where(
            ModelRegistry.workspace_id == workspace_id,
            ModelRegistry.slug == slug,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, model: ModelRegistry) -> ModelRegistry:
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        return model

    async def update(self, model: ModelRegistry) -> ModelRegistry:
        await self.db.commit()
        await self.db.refresh(model)
        return model

    async def delete(self, model: ModelRegistry) -> None:
        await self.db.delete(model)
        await self.db.commit()
