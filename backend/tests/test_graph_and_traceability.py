import pytest
import uuid
from datetime import datetime, timezone
from app.schemas.graph import (
    RelationshipCreate,
    GraphNode,
    GraphEdge,
    GraphStats,
    LineagePath,
    LineageTrace,
    OrphanItem,
    OrphanAuditReport,
)
from app.schemas.decision import DecisionCreate, DecisionRead


def test_relationship_schema_validation():
    source_id = uuid.uuid4()
    target_id = uuid.uuid4()
    rel = RelationshipCreate(
        source_type="hypothesis",
        source_id=source_id,
        target_type="experiment",
        target_id=target_id,
        relation_type="tests",
        metadata={"rationale": "Empirically evaluate inference accuracy on Jetson Nano"},
    )
    assert rel.source_type == "hypothesis"
    assert rel.target_type == "experiment"
    assert rel.relation_type == "tests"
    assert rel.source_id == source_id


def test_graph_node_and_edge_schemas():
    node = GraphNode(
        id=str(uuid.uuid4()),
        type="hypothesis",
        code="H-001",
        label="Sparse attention reduces memory footprint by 4x without accuracy loss.",
        status="testing",
        metadata={"confidence": 0.85},
    )
    assert node.code == "H-001"
    assert node.type == "hypothesis"

    edge = GraphEdge(
        id=str(uuid.uuid4()),
        source=node.id,
        source_type="hypothesis",
        target=str(uuid.uuid4()),
        target_type="experiment",
        relation_type="tests",
    )
    assert edge.relation_type == "tests"


def test_lineage_trace_structure():
    root = GraphNode(
        id=str(uuid.uuid4()),
        type="claim",
        code="C-001",
        label="Spatial patch folding preserves mucosal lesion boundaries.",
        status="verified",
    )
    path = LineagePath(
        path_length=4,
        node_ids=[str(uuid.uuid4()), str(uuid.uuid4()), str(uuid.uuid4()), root.id],
        node_codes=["Q-001", "H-001", "R-001", "C-001"],
        descriptions=["Q-001: Video Capsule Endoscopy", "H-001: 4-bit INT Quantization", "R-001: 48.6 FPS Validation", "C-001: Claim"],
        relation_types=["addresses", "tests", "supports"],
    )
    trace = LineageTrace(
        workspace_id=uuid.uuid4(),
        root_node=root,
        direction="backward",
        traversal_depth=4,
        nodes=[root],
        edges=[],
        paths=[path],
    )
    assert trace.direction == "backward"
    assert len(trace.paths) == 1
    assert trace.paths[0].node_codes[0] == "Q-001"


def test_orphan_audit_report_schema():
    orphan = OrphanItem(
        id=uuid.uuid4(),
        type="hypothesis",
        code="H-004",
        title="Dynamic token pruning on microcontrollers.",
        reason="Hypothesis is unverified: no empirical experiments are linked to test it.",
        severity="critical",
        suggested_action="Design and link an experiment to evaluate this hypothesis.",
    )
    report = OrphanAuditReport(
        workspace_id=uuid.uuid4(),
        total_entities=10,
        total_orphans=1,
        connected_entities=9,
        health_score=90.0,
        orphans=[orphan],
        summary_by_type={"hypothesis": 1},
        generated_at=datetime.now(timezone.utc),
    )
    assert report.total_orphans == 1
    assert report.health_score == 90.0
    assert report.orphans[0].severity == "critical"


def test_decision_schema_validation():
    dec = DecisionCreate(
        title="Adopt 4-Bit INT Quantization with Spatial Patch Folding for Edge WCE Deployments",
        outcome="accepted",
        rationale="Empirical trials on NVIDIA Jetson Nano confirmed 48.6 FPS throughput at 2.1W power budget with 0.952 AUC.",
        implications="Firmware architecture will target INT4 TensorRT deployment pipelines.",
        linked_result_ids=[uuid.uuid4()],
        linked_hypothesis_ids=[uuid.uuid4()],
    )
    assert dec.outcome == "accepted"
    assert len(dec.linked_result_ids) == 1
    assert len(dec.linked_hypothesis_ids) == 1
