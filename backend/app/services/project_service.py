import re
import uuid
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.research_question import ResearchQuestion
from app.models.paper import Paper
from app.models.gap import Gap
from app.models.hypothesis import Hypothesis
from app.models.experiment import Experiment
from app.models.result import Result
from app.models.decision import Decision
from app.models.claim import Claim

from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead, ProjectSummary
from app.repositories.project_repository import ProjectRepository
from app.repositories.workspace_repository import WorkspaceRepository


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.project_repo = ProjectRepository(db)
        self.workspace_repo = WorkspaceRepository(db)

    async def _get_workspace_summary(self, workspace_id: uuid.UUID) -> ProjectSummary:
        """Computes current entity counts for the research line."""
        q_count = await self.db.scalar(
            select(func.count(ResearchQuestion.id)).where(ResearchQuestion.workspace_id == workspace_id)
        ) or 0
        p_count = await self.db.scalar(
            select(func.count(Paper.id)).where(Paper.workspace_id == workspace_id)
        ) or 0
        g_count = await self.db.scalar(
            select(func.count(Gap.id)).where(Gap.workspace_id == workspace_id)
        ) or 0
        h_count = await self.db.scalar(
            select(func.count(Hypothesis.id)).where(Hypothesis.workspace_id == workspace_id)
        ) or 0
        e_count = await self.db.scalar(
            select(func.count(Experiment.id)).where(Experiment.workspace_id == workspace_id)
        ) or 0
        r_count = await self.db.scalar(
            select(func.count(Result.id)).where(Result.workspace_id == workspace_id)
        ) or 0
        d_count = await self.db.scalar(
            select(func.count(Decision.id)).where(Decision.workspace_id == workspace_id)
        ) or 0
        c_count = await self.db.scalar(
            select(func.count(Claim.id)).where(Claim.workspace_id == workspace_id)
        ) or 0

        return ProjectSummary(
            questions_count=q_count,
            papers_count=p_count,
            gaps_count=g_count,
            hypotheses_count=h_count,
            experiments_count=e_count,
            results_count=r_count,
            decisions_count=d_count,
            claims_count=c_count,
        )

    async def list_projects(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        status_filter: Optional[str] = None,
    ) -> List[ProjectRead]:
        membership = await self.workspace_repo.get_membership(workspace_id, user_id)
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this workspace.",
            )

        projects = await self.project_repo.list_by_workspace(workspace_id, status_filter)
        summary = await self._get_workspace_summary(workspace_id)

        results = []
        for p in projects:
            read = ProjectRead.model_validate(p)
            read.summary = summary
            results.append(read)
        return results

    async def get_project(
        self,
        project_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> ProjectRead:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research project not found.",
            )

        membership = await self.workspace_repo.get_membership(project.workspace_id, user_id)
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this project.",
            )

        summary = await self._get_workspace_summary(project.workspace_id)
        read = ProjectRead.model_validate(project)
        read.summary = summary
        return read

    async def create_project(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        project_in: ProjectCreate,
    ) -> ProjectRead:
        membership = await self.workspace_repo.get_membership(workspace_id, user_id)
        if not membership or membership.role not in ["owner", "admin", "researcher"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to create projects in this workspace.",
            )

        # Generate slug
        base_slug = project_in.slug or re.sub(r"[^a-z0-9]+", "-", project_in.name.lower().strip()).strip("-")
        slug = base_slug
        counter = 1
        while await self.project_repo.get_by_slug(workspace_id, slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        project = Project(
            workspace_id=workspace_id,
            name=project_in.name.strip(),
            slug=slug,
            research_area=project_in.research_area.strip() if project_in.research_area else None,
            description=project_in.description.strip() if project_in.description else None,
            status=project_in.status,
            created_by=user_id,
        )
        created = await self.project_repo.create(project)
        summary = await self._get_workspace_summary(workspace_id)
        read = ProjectRead.model_validate(created)
        read.summary = summary
        return read

    async def update_project(
        self,
        project_id: uuid.UUID,
        user_id: uuid.UUID,
        project_in: ProjectUpdate,
    ) -> ProjectRead:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research project not found.",
            )

        membership = await self.workspace_repo.get_membership(project.workspace_id, user_id)
        if not membership or membership.role not in ["owner", "admin", "researcher"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this project.",
            )

        if project_in.name is not None:
            project.name = project_in.name.strip()
        if project_in.research_area is not None:
            project.research_area = project_in.research_area.strip() if project_in.research_area else None
        if project_in.description is not None:
            project.description = project_in.description.strip() if project_in.description else None
        if project_in.status is not None:
            project.status = project_in.status

        updated = await self.project_repo.update(project)
        summary = await self._get_workspace_summary(project.workspace_id)
        read = ProjectRead.model_validate(updated)
        read.summary = summary
        return read

    async def delete_project(
        self,
        project_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> bool:
        project = await self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Research project not found.",
            )

        membership = await self.workspace_repo.get_membership(project.workspace_id, user_id)
        if not membership or membership.role not in ["owner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only workspace owners or admins can delete research projects.",
            )

        return await self.project_repo.delete(project)
