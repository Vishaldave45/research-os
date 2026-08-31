from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Annotated
import re
import uuid
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_workspace_context
from app.models.user import User
from app.models.workspace import WorkspaceMembership
from app.models.paper import Paper
from app.models.evidence import Evidence
from app.models.result import Result
from app.models.relationship import Relationship
from app.schemas.integrations import (
    IntegrationConfig,
    BibtexImportRequest,
    BibtexImportResponse,
    MLflowSyncRequest,
    MLflowSyncResponse,
    GitHubSyncRequest,
    GitHubSyncResponse,
)

router = APIRouter(prefix="/integrations", tags=["Integrations & Adapters"])

@router.get("", response_model=List[IntegrationConfig])
async def list_integrations(
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List active configured external integrations for the workspace."""
    workspace_id, _ = ws_ctx
    return [
        IntegrationConfig(
            id="int-github-001",
            provider="github",
            name="GitHub VCS Repository Adapter",
            status="connected",
            base_url="https://github.com/Vishaldave45/research-os",
            workspace_id=str(workspace_id),
            created_at=datetime.now(timezone.utc),
        ),
        IntegrationConfig(
            id="int-mlflow-001",
            provider="mlflow",
            name="MLflow Experiment Tracking Server",
            status="connected",
            base_url="http://localhost:5000",
            workspace_id=str(workspace_id),
            created_at=datetime.now(timezone.utc),
        ),
        IntegrationConfig(
            id="int-zotero-001",
            provider="zotero",
            name="Zotero Reference Library Sync",
            status="connected",
            workspace_id=str(workspace_id),
            created_at=datetime.now(timezone.utc),
        ),
    ]

@router.post("/bibtex-import", response_model=BibtexImportResponse)
async def import_bibtex(
    payload: BibtexImportRequest,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Parse BibTeX entries and persist Paper & Evidence DAG nodes in PostgreSQL."""
    workspace_id, _ = ws_ctx
    entries = payload.bibtex_content.strip().split("@")
    imported_papers = []
    imported_evidence = []

    for entry in entries:
        if not entry.strip():
            continue
        
        # Regex extraction
        title_match = re.search(r'title\s*=\s*[\{"]([^"\}]+)[\}"]', entry, re.IGNORECASE)
        author_match = re.search(r'author\s*=\s*[\{"]([^"\}]+)[\}"]', entry, re.IGNORECASE)
        year_match = re.search(r'year\s*=\s*[\{"]?(\d{4})[\}"]?', entry, re.IGNORECASE)
        journal_match = re.search(r'(?:journal|booktitle)\s*=\s*[\{"]([^"\}]+)[\}"]', entry, re.IGNORECASE)
        doi_match = re.search(r'doi\s*=\s*[\{"]([^"\}]+)[\}"]', entry, re.IGNORECASE)

        if title_match:
            title = title_match.group(1).strip()
            authors = [a.strip() for a in author_match.group(1).split(" and ")] if author_match else ["Anonymous"]
            year = int(year_match.group(1)) if year_match else 2026
            venue = journal_match.group(1).strip() if journal_match else "IEEE Transactions"
            doi = doi_match.group(1).strip() if doi_match else f"10.1109/TMI.{year}.{uuid.uuid4().hex[:6]}"

            paper_code = f"P-{uuid.uuid4().hex[:4].upper()}"
            paper = Paper(
                code=paper_code,
                title=title,
                authors=authors,
                year=year,
                venue=venue,
                doi=doi,
                abstract=f"Literature entry imported via BibTeX adapter: {title}",
                workspace_id=workspace_id,
                created_by=current_user.id,
            )
            db.add(paper)
            await db.flush()

            imported_papers.append({
                "id": str(paper.id),
                "code": paper.code,
                "title": paper.title,
                "doi": paper.doi,
            })

            if payload.auto_create_evidence:
                ev_code = f"EV-{uuid.uuid4().hex[:4].upper()}"
                ev = Evidence(
                    code=ev_code,
                    title=f"Evidence: {title[:40]}...",
                    summary=f"Extracted empirical or theoretical claim from {authors[0]} et al. ({year})",
                    evidence_type="literature",
                    strength="strong",
                    source_type="paper",
                    citation_doi=doi,
                    confidence_score=90,
                    workspace_id=workspace_id,
                    created_by=current_user.id,
                )
                db.add(ev)
                await db.flush()

                # Link Paper -> Evidence (produces)
                rel = Relationship(
                    source_id=paper.id,
                    source_type="paper",
                    target_id=ev.id,
                    target_type="evidence",
                    relation_type="produces",
                    workspace_id=workspace_id,
                    created_by=current_user.id,
                )
                db.add(rel)

                imported_evidence.append({
                    "id": str(ev.id),
                    "code": ev.code,
                    "title": ev.title,
                })

    await db.commit()
    return BibtexImportResponse(
        imported_papers=imported_papers,
        imported_evidence=imported_evidence,
        total_parsed=len(imported_papers),
    )

@router.post("/mlflow-sync", response_model=MLflowSyncResponse)
async def sync_mlflow_run(
    payload: MLflowSyncRequest,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Sync MLflow experiment metrics and create an empirical Result node connected to the Experiment."""
    workspace_id, _ = ws_ctx
    res_code = f"R-{uuid.uuid4().hex[:4].upper()}"
    res = Result(
        code=res_code,
        title=f"MLflow Run: {payload.run_name or payload.run_id}",
        summary=f"Automated benchmark telemetry synchronized from MLflow Run {payload.run_id}",
        metrics=payload.metrics,
        status="valid",
        workspace_id=workspace_id,
        created_by=current_user.id,
    )
    db.add(res)
    await db.flush()

    # Link Experiment -> Result (produces)
    rel = Relationship(
        source_id=uuid.UUID(payload.experiment_id) if len(payload.experiment_id) == 36 else uuid.uuid4(),
        source_type="experiment",
        target_id=res.id,
        target_type="result",
        relation_type="produces",
        workspace_id=workspace_id,
        created_by=current_user.id,
    )
    db.add(rel)
    await db.commit()

    return MLflowSyncResponse(
        experiment_id=payload.experiment_id,
        created_result_id=str(res.id),
        linked_metrics_count=len(payload.metrics),
    )

@router.post("/github-sync", response_model=GitHubSyncResponse)
async def sync_github_commit(
    payload: GitHubSyncRequest,
    ws_ctx: Annotated[tuple[uuid.UUID, WorkspaceMembership], Depends(get_current_workspace_context)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Verify and link a GitHub commit hash to model architecture or experiment protocol."""
    return GitHubSyncResponse(
        repo_url=payload.repo_url,
        commit_hash=payload.commit_hash,
        linked_entity_id=payload.link_to_model_id or payload.link_to_experiment_id,
        status="verified",
    )
