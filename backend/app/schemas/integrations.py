from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class IntegrationConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    provider: str  # github, mlflow, wandb, zotero, openalex
    name: str
    status: str = "connected"  # connected, disconnected, error
    base_url: Optional[str] = None
    workspace_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BibtexImportRequest(BaseModel):
    bibtex_content: str
    auto_create_evidence: bool = True
    target_question_id: Optional[str] = None

class BibtexImportResponse(BaseModel):
    imported_papers: List[Dict[str, Any]]
    imported_evidence: List[Dict[str, Any]]
    total_parsed: int
    status: str = "success"

class MLflowSyncRequest(BaseModel):
    experiment_id: str
    run_id: str
    run_name: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    metrics: Dict[str, float] = Field(default_factory=dict)
    artifact_uris: List[str] = Field(default_factory=list)

class MLflowSyncResponse(BaseModel):
    experiment_id: str
    created_result_id: str
    linked_metrics_count: int
    status: str = "synchronized"

class GitHubSyncRequest(BaseModel):
    repo_url: str
    commit_hash: str
    branch: Optional[str] = "main"
    link_to_model_id: Optional[str] = None
    link_to_experiment_id: Optional[str] = None

class GitHubSyncResponse(BaseModel):
    repo_url: str
    commit_hash: str
    linked_entity_id: Optional[str] = None
    status: str = "verified"
