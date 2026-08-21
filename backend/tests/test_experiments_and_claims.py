import pytest
import uuid
from app.schemas.experiment_and_result import (
    ExperimentCreate,
    ExperimentRead,
    ResultCreate,
    ResultRead,
)
from app.schemas.claim import (
    ClaimCreate,
    ClaimRead,
)


def test_experiment_schema_validation():
    exp = ExperimentCreate(
        title="4-Bit INT Quantization and Spatial Patch Folding Evaluation on Jetson Nano",
        description="Empirical execution on edge WCE hardware testbed measuring FPS, thermal dissipation, and sensitivity.",
        status="completed",
        config={
            "quantization": "INT4",
            "batch_size": 1,
            "architecture": "FoldedViT-Tiny",
            "lr": 0.0003,
        },
        execution_metadata={
            "device": "NVIDIA Jetson Nano 4GB",
            "duration_seconds": 1420,
            "commit": "a1b2c3d4",
        },
    )
    assert exp.status == "completed"
    assert exp.config["quantization"] == "INT4"
    assert exp.execution_metadata["device"] == "NVIDIA Jetson Nano 4GB"


def test_result_schema_validation():
    parent_exp_id = uuid.uuid4()
    res = ResultCreate(
        experiment_id=parent_exp_id,
        title="Edge TPU Inference Metrics & Diagnostic Sensitivity",
        summary="Achieved 48.6 FPS at 2.1W power draw with bleeding/polyp detection AUC of 0.952.",
        metrics={
            "fps": 48.6,
            "power_watts": 2.1,
            "auc": 0.952,
            "sensitivity": 0.941,
            "specificity": 0.963,
            "latency_ms": 10.3,
        },
        artifacts=[
            {
                "type": "roc_curve",
                "name": "wce_roc_int4.png",
                "url": "https://storage.researchos.org/artifacts/wce_roc.png",
            }
        ],
        status="valid",
    )
    assert res.experiment_id == parent_exp_id
    assert res.metrics["fps"] == 48.6
    assert res.metrics["auc"] >= 0.95
    assert len(res.artifacts) == 1


def test_claim_schema_validation():
    claim = ClaimCreate(
        statement="Spatial patch folding preserves multi-scale mucosal lesion boundaries under extreme 4-bit INT quantization.",
        confidence_score=0.96,
        status="verified",
        metadata={
            "methodology": "Empirical Edge Validation",
            "cross_validated": True,
        },
    )
    assert claim.confidence_score == 0.96
    assert claim.status == "verified"
    assert claim.metadata["cross_validated"] is True
