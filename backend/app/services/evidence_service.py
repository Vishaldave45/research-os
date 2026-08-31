import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.evidence import Evidence
from app.repositories.evidence_repository import EvidenceRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.evidence import EvidenceCreate, EvidenceUpdate, EvidenceRead


class EvidenceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = EvidenceRepository(db)
        self.ws_repo = WorkspaceRepository(db)

    async def list_evidence(
        self,
        workspace_id: uuid.UUID,
        evidence_type: Optional[str] = None,
        strength: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[EvidenceRead]:
        items = await self.repo.list_by_workspace(
            workspace_id=workspace_id,
            evidence_type=evidence_type,
            strength=strength,
            search=search,
        )
        return [EvidenceRead.model_validate(e) for e in items]

    async def create_evidence(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        evidence_in: EvidenceCreate,
    ) -> EvidenceRead:
        code = await self.repo.get_next_code(workspace_id)
        evidence = Evidence(
            workspace_id=workspace_id,
            code=code,
            title=evidence_in.title,
            summary=evidence_in.summary,
            evidence_type=evidence_in.evidence_type,
            strength=evidence_in.strength,
            source_type=evidence_in.source_type,
            source_id=evidence_in.source_id,
            citation_doi=evidence_in.citation_doi,
            confidence_score=evidence_in.confidence_score,
            metadata_json=evidence_in.metadata_json,
            created_by=user_id,
        )
        created = await self.repo.create(evidence)
        return EvidenceRead.model_validate(created)

    async def get_evidence(self, evidence_id: uuid.UUID, workspace_id: uuid.UUID) -> EvidenceRead:
        evidence = await self.repo.get_by_id(evidence_id)
        if not evidence or evidence.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence record not found.")
        return EvidenceRead.model_validate(evidence)

    async def update_evidence(
        self,
        evidence_id: uuid.UUID,
        workspace_id: uuid.UUID,
        update_in: EvidenceUpdate,
    ) -> EvidenceRead:
        evidence = await self.repo.get_by_id(evidence_id)
        if not evidence or evidence.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence record not found.")

        if update_in.title is not None:
            evidence.title = update_in.title
        if update_in.summary is not None:
            evidence.summary = update_in.summary
        if update_in.evidence_type is not None:
            evidence.evidence_type = update_in.evidence_type
        if update_in.strength is not None:
            evidence.strength = update_in.strength
        if update_in.source_type is not None:
            evidence.source_type = update_in.source_type
        if update_in.source_id is not None:
            evidence.source_id = update_in.source_id
        if update_in.citation_doi is not None:
            evidence.citation_doi = update_in.citation_doi
        if update_in.confidence_score is not None:
            evidence.confidence_score = update_in.confidence_score
        if update_in.metadata_json is not None:
            evidence.metadata_json = update_in.metadata_json

        updated = await self.repo.update(evidence)
        return EvidenceRead.model_validate(updated)

    async def delete_evidence(self, evidence_id: uuid.UUID, workspace_id: uuid.UUID) -> None:
        evidence = await self.repo.get_by_id(evidence_id)
        if not evidence or evidence.workspace_id != workspace_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence record not found.")
        await self.repo.delete(evidence)
