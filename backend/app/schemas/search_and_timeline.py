import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class SearchResultItem(BaseModel):
    id: uuid.UUID
    code: str
    type: str  # question, paper, evidence, dataset, model, gap, hypothesis, experiment, result, decision, claim
    title: str
    snippet: str
    created_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)


class GlobalSearchResponse(BaseModel):
    query: str
    total_results: int
    results_by_type: Dict[str, int]
    items: List[SearchResultItem]


class TimelineEventItem(BaseModel):
    id: uuid.UUID
    code: str
    entity_type: str
    event_type: str  # created, tested, supported, refuted, decided, claimed
    title: str
    summary: Optional[str] = None
    timestamp: datetime
    author_id: Optional[uuid.UUID] = None
    upstream_codes: List[str] = Field(default_factory=list)
    downstream_codes: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)


class TimelineResponse(BaseModel):
    workspace_id: uuid.UUID
    total_events: int
    events: List[TimelineEventItem]
