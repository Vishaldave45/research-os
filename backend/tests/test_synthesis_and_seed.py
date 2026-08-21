import pytest
import uuid
from datetime import datetime, timezone
from app.schemas.synthesis import (
    LiteratureSynthesisRequest,
    LiteratureSynthesisResponse,
    LiteratureMatrixRow,
    GapAnalysisRequest,
    GapAnalysisResponse,
    DiscoveredGapProposal,
    ClaimValidationRequest,
    ClaimValidationResponse,
    EvidenceChainSummaryResponse,
)


def test_literature_synthesis_schemas():
    p_id = str(uuid.uuid4())
    row = LiteratureMatrixRow(
        paper_id=p_id,
        paper_code="P-001",
        paper_title="Vision Transformers for Gastrointestinal Video Capsule Endoscopy",
        authors="Almeida, R., Venkatesh, S.",
        year=2023,
        venue="IEEE TMI",
        methodology="Edge ViT Latency Benchmarking",
        key_metrics={"fps": 45, "power_watts": 2.1},
        strengths=["High lesion boundary fidelity"],
        limitations=["Standard floating point exceeds thermal budget"],
    )
    assert row.paper_code == "P-001"
    assert row.key_metrics["fps"] == 45

    ws_id = uuid.uuid4()
    resp = LiteratureSynthesisResponse(
        workspace_id=ws_id,
        executive_summary="Synthesized review of WCE literature demonstrates critical latency-thermal tradeoff.",
        thematic_areas=["Quantization", "Thermal Boundaries"],
        comparative_matrix=[row],
        consensus_findings=["Standard ViT exceeds 2.5W"],
        contested_findings=["INT4 vs INT8 boundary preservation"],
        identified_gaps=["Activation outlier clamping"],
        generated_at=datetime.now(timezone.utc),
    )
    assert resp.workspace_id == ws_id
    assert len(resp.comparative_matrix) == 1
    assert resp.thematic_areas[0] == "Quantization"


def test_gap_analysis_schemas():
    proposal = DiscoveredGapProposal(
        title="Dynamic Token Gating for Non-Pathological Mucosa Frames",
        description="Over 85% of frames contain normal mucosa without lesions.",
        impact_level="high",
        motivating_paper_codes=["P-001", "P-004"],
        proposed_hypothesis="A two-stage lightweight gate will reduce power consumption by 40%.",
        recommended_experiment_protocol="Train lightweight MobileNetV4 gate on Kvasir-Capsule.",
    )
    assert proposal.impact_level == "high"
    assert proposal.motivating_paper_codes == ["P-001", "P-004"]

    ws_id = uuid.uuid4()
    resp = GapAnalysisResponse(
        workspace_id=ws_id,
        analysis_overview="Discovered 3 high-impact gaps across paper corpus.",
        discovered_gaps=[proposal],
        recommended_next_steps=["Link proposal as hypothesis"],
        generated_at=datetime.now(timezone.utc),
    )
    assert len(resp.discovered_gaps) == 1
    assert resp.discovered_gaps[0].impact_level == "high"


def test_claim_validation_schemas():
    claim_id = uuid.uuid4()
    resp = ClaimValidationResponse(
        claim_id=claim_id,
        claim_code="C-001",
        claim_statement="Spatial patch folding preserves mucosal lesion boundaries under 4-bit INT quantization.",
        current_status="verified",
        evidentiary_score=0.96,
        support_level="strongly_supported",
        supporting_results=[{"code": "R-001", "auc": 0.952, "power_watts": 2.1}],
        contradicting_results=[],
        citing_papers=[{"code": "P-003", "title": "Spatial Patch Folding"}],
        validation_critique="Claim is backed by empirical hardware metrics on NVIDIA Jetson Nano.",
        recommended_actions=["Ready for publication"],
    )
    assert resp.evidentiary_score == 0.96
    assert resp.support_level == "strongly_supported"
    assert len(resp.supporting_results) == 1


def test_evidence_chain_summary_schema():
    ws_id = uuid.uuid4()
    resp = EvidenceChainSummaryResponse(
        workspace_id=ws_id,
        question_code="Q-001",
        question_title="How can high-frame-rate Transformer architectures achieve real-time mucosal lesion detection?",
        total_connected_artifacts=10,
        narrative_summary="Full verified reasoning chain from literature to empirical hardware decision.",
        milestones=[
            {"phase": "Literature Grounding", "summary": "Identified INT4 gap"},
            {"phase": "Empirical Execution", "summary": "Verified 48.6 FPS at 2.1W"},
        ],
        current_verdict="Empirically Resolved & Accepted",
    )
    assert resp.total_connected_artifacts == 10
    assert resp.current_verdict == "Empirically Resolved & Accepted"
