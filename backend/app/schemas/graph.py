import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict


EntityType = Literal[
    "question",
    "paper",
    "gap",
    "hypothesis",
    "experiment",
    "result",
    "decision",
    "claim",
]

RelationType = Literal[
    "supports",
    "refutes",
    "tests",
    "derived_from",
    "informs",
    "cites",
    "produces",
    "motivates",
    "contradicts",
    "depends_on",
    "addresses",
    "identifies",
]


class RelationshipBase(BaseModel):
    source_type: EntityType = Field(..., description="Source node entity type")
    source_id: uuid.UUID = Field(..., description="Source node entity UUID")
    target_type: EntityType = Field(..., description="Target node entity type")
    target_id: uuid.UUID = Field(..., description="Target node entity UUID")
    relation_type: RelationType = Field(..., description="Semantic directed relation type")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RelationshipCreate(RelationshipBase):
    pass


class RelationshipBatchCreate(BaseModel):
    relationships: List[RelationshipCreate] = Field(..., min_length=1)


class RelationshipRead(RelationshipBase):
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_by: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GraphNode(BaseModel):
    id: str  # UUID as string
    type: str  # 'question', 'paper', 'gap', 'hypothesis', 'experiment', 'result', 'decision', 'claim'
    code: str  # e.g., 'Q-001', 'P-001', 'G-001', 'H-001', 'E-001', 'R-001', 'D-001', 'C-001'
    label: str  # Title, statement, or name
    status: Optional[str] = None  # e.g., 'open', 'testing', 'valid', 'accepted', 'verified'
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None


class GraphEdge(BaseModel):
    id: str  # UUID as string
    source: str  # Source node ID
    source_type: str
    target: str  # Target node ID
    target_type: str
    relation_type: str  # 'supports', 'tests', 'addresses', etc.
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None


class GraphStats(BaseModel):
    total_nodes: int
    total_edges: int
    nodes_by_type: Dict[str, int]
    edges_by_relation: Dict[str, int]
    density: float
    health_score: float  # 0.0 to 100.0


class GraphResponse(BaseModel):
    workspace_id: uuid.UUID
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: GraphStats


class LineagePath(BaseModel):
    path_length: int
    node_ids: List[str]
    node_codes: List[str]
    descriptions: List[str]
    relation_types: List[str]


class LineageTrace(BaseModel):
    workspace_id: uuid.UUID
    root_node: GraphNode
    direction: Literal["forward", "backward", "bidirectional"]
    traversal_depth: int
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    paths: List[LineagePath]


class OrphanItem(BaseModel):
    id: uuid.UUID
    type: str
    code: str
    title: str
    reason: str
    severity: Literal["critical", "high", "medium", "low"]
    suggested_action: str


class OrphanAuditReport(BaseModel):
    workspace_id: uuid.UUID
    total_entities: int
    total_orphans: int
    connected_entities: int
    health_score: float
    orphans: List[OrphanItem]
    summary_by_type: Dict[str, int]
    generated_at: datetime
