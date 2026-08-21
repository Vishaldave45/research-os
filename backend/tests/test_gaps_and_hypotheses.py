import pytest
from app.schemas.gap_and_hypothesis import (
    GapCreate,
    GapRead,
    HypothesisCreate,
    HypothesisRead,
)


def test_gap_schema_validation():
    gap = GapCreate(
        title="High computational latency during WCE real-time edge processing",
        description="Standard ViT and ResNet-50 backbones exceed the 15ms frame budget required for live capsule video inspection.",
        impact_level="critical",
        status="open",
        metadata={"max_allowed_ms": 15, "tested_device": "Jetson Nano"},
    )
    assert gap.impact_level == "critical"
    assert gap.status == "open"
    assert gap.metadata["max_allowed_ms"] == 15


def test_hypothesis_schema_validation():
    hypothesis = HypothesisCreate(
        statement="Hierarchical spatial folding combined with 4-bit INT quantization reduces FLOPs by >60% while maintaining diagnostic AUC >= 0.94.",
        rationale="Spatial redundancy across adjacent WCE frames allows aggressive cross-patch pooling without loss of mucosal lesion features.",
        expected_outcome="Throughput >= 45 FPS on edge embedded TPU at <2.5W power envelope.",
        status="testing",
        metadata={"target_auc": 0.94, "target_fps": 45},
    )
    assert hypothesis.status == "testing"
    assert "INT quantization" in hypothesis.statement
    assert hypothesis.metadata["target_auc"] == 0.94
