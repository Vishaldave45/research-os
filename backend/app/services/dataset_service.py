import re
import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.dataset import Dataset
from app.repositories.dataset_repository import DatasetRepository
from app.schemas.dataset import DatasetCreate, DatasetUpdate, DatasetRead


class DatasetService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DatasetRepository(db)

    async def list_datasets(
        self,
        workspace_id: uuid.UUID,
        modality: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[DatasetRead]:
        items = await self.repo.list_by_workspace(
            workspace_id=workspace_id,
            modality=modality,
            search=search,
        )
        return [DatasetRead.model_validate(d) for d in items]

    async def create_dataset(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        dataset_in: DatasetCreate,
    ) -> DatasetRead:
        clean_slug = re.sub(r"[^a-z0-9]+", "-", dataset_in.name.lower()).strip("-")
        slug = f"{clean_slug}-{uuid.uuid4().hex[:4]}"

        dataset = Dataset(
            workspace_id=workspace_id,
            name=dataset_in.name,
            slug=slug,
            version=dataset_in.version,
            modality=dataset_in.modality,
            description=dataset_in.description,
            source_url=dataset_in.source_url,
            license=dataset_in.license,
            sample_count=dataset_in.sample_count,
            size_bytes=dataset_in.size_bytes,
            preprocessing_spec=dataset_in.preprocessing_spec,
            split_spec=dataset_in.split_spec,
            metadata_json=dataset_in.metadata_json,
            created_by=user_id,
        )
        created = await self.repo.create(dataset)
        return DatasetRead.model_validate(created)

    async def get_dataset(self, dataset_id: uuid.UUID, workspace_id: uuid.UUID) -> DatasetRead:
        dataset = await self.repo.get_by_id(dataset_id)
        if not dataset or dataset.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset record not found.")
        return DatasetRead.model_validate(dataset)

    async def update_dataset(
        self,
        dataset_id: uuid.UUID,
        workspace_id: uuid.UUID,
        update_in: DatasetUpdate,
    ) -> DatasetRead:
        dataset = await self.repo.get_by_id(dataset_id)
        if not dataset or dataset.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset record not found.")

        if update_in.name is not None:
            dataset.name = update_in.name
        if update_in.version is not None:
            dataset.version = update_in.version
        if update_in.modality is not None:
            dataset.modality = update_in.modality
        if update_in.description is not None:
            dataset.description = update_in.description
        if update_in.source_url is not None:
            dataset.source_url = update_in.source_url
        if update_in.license is not None:
            dataset.license = update_in.license
        if update_in.sample_count is not None:
            dataset.sample_count = update_in.sample_count
        if update_in.size_bytes is not None:
            dataset.size_bytes = update_in.size_bytes
        if update_in.preprocessing_spec is not None:
            dataset.preprocessing_spec = update_in.preprocessing_spec
        if update_in.split_spec is not None:
            dataset.split_spec = update_in.split_spec
        if update_in.metadata_json is not None:
            dataset.metadata_json = update_in.metadata_json

        updated = await self.repo.update(dataset)
        return DatasetRead.model_validate(updated)

    async def delete_dataset(self, dataset_id: uuid.UUID, workspace_id: uuid.UUID) -> None:
        dataset = await self.repo.get_by_id(dataset_id)
        if not dataset or dataset.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset record not found.")
        await self.repo.delete(dataset)
