import re
import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.model_registry import ModelRegistry
from app.repositories.model_repository import ModelRepository
from app.schemas.model_registry import ModelCreate, ModelUpdate, ModelRead


class ModelService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ModelRepository(db)

    async def list_models(
        self,
        workspace_id: uuid.UUID,
        architecture: Optional[str] = None,
        framework: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[ModelRead]:
        items = await self.repo.list_by_workspace(
            workspace_id=workspace_id,
            architecture=architecture,
            framework=framework,
            search=search,
        )
        return [ModelRead.model_validate(m) for m in items]

    async def create_model(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        model_in: ModelCreate,
    ) -> ModelRead:
        clean_slug = re.sub(r"[^a-z0-9]+", "-", model_in.name.lower()).strip("-")
        slug = f"{clean_slug}-{uuid.uuid4().hex[:4]}"

        model = ModelRegistry(
            workspace_id=workspace_id,
            name=model_in.name,
            slug=slug,
            version=model_in.version,
            architecture=model_in.architecture,
            framework=model_in.framework,
            parameter_count=model_in.parameter_count,
            checkpoint_url=model_in.checkpoint_url,
            code_commit_hash=model_in.code_commit_hash,
            description=model_in.description,
            hyperparameters=model_in.hyperparameters,
            metadata_json=model_in.metadata_json,
            created_by=user_id,
        )
        created = await self.repo.create(model)
        return ModelRead.model_validate(created)

    async def get_model(self, model_id: uuid.UUID, workspace_id: uuid.UUID) -> ModelRead:
        model = await self.repo.get_by_id(model_id)
        if not model or model.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model record not found.")
        return ModelRead.model_validate(model)

    async def update_model(
        self,
        model_id: uuid.UUID,
        workspace_id: uuid.UUID,
        update_in: ModelUpdate,
    ) -> ModelRead:
        model = await self.repo.get_by_id(model_id)
        if not model or model.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model record not found.")

        if update_in.name is not None:
            model.name = update_in.name
        if update_in.version is not None:
            model.version = update_in.version
        if update_in.architecture is not None:
            model.architecture = update_in.architecture
        if update_in.framework is not None:
            model.framework = update_in.framework
        if update_in.parameter_count is not None:
            model.parameter_count = update_in.parameter_count
        if update_in.checkpoint_url is not None:
            model.checkpoint_url = update_in.checkpoint_url
        if update_in.code_commit_hash is not None:
            model.code_commit_hash = update_in.code_commit_hash
        if update_in.description is not None:
            model.description = update_in.description
        if update_in.hyperparameters is not None:
            model.hyperparameters = update_in.hyperparameters
        if update_in.metadata_json is not None:
            model.metadata_json = update_in.metadata_json

        updated = await self.repo.update(model)
        return ModelRead.model_validate(updated)

    async def delete_model(self, model_id: uuid.UUID, workspace_id: uuid.UUID) -> None:
        model = await self.repo.get_by_id(model_id)
        if not model or model.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model record not found.")
        await self.repo.delete(model)
