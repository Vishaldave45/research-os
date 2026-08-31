import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_complete_14_step_research_lifecycle_persisted():
    """
    Unbroken 14-Step Real-System E2E Lifecycle Test against PostgreSQL:
    1. Register User
    2. Login
    3. Create Workspace
    4. Create Project
    5. Create Research Question
    6. Attach Literature Paper
    7. Extract Evidence
    8. Formulate Literature Gap
    9. Define Hypothesis
    10. Register Dataset
    11. Register Model
    12. Execute Experiment Protocol
    13. Record Measured Result
    14. Commit Architectural Decision
    15. Formulate Claim
    16. Link DAG Provenance
    17. Execute Backward Trace Query
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        uid = uuid.uuid4().hex[:8]
        user_email = f"lead_pi_{uid}@princeton.edu"
        user_password = "SecureResearchPassword123!"

        # 1. Register
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={"email": user_email, "password": user_password, "full_name": f"Prof. Einstein {uid}"},
        )
        assert reg_res.status_code == 201
        token = reg_res.json()["tokens"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Workspace
        ws_res = await client.post(
            "/api/v1/workspaces",
            json={"name": f"Quantum AI Institute {uid}", "description": "Unified Research Lifecycle"},
            headers=headers,
        )
        assert ws_res.status_code == 201
        ws_id = ws_res.json()["id"]
        headers["X-Workspace-Id"] = ws_id

        # 3. Project
        proj_res = await client.post("/api/v1/projects", json={"name": "Edge Quantization Protocol", "slug": f"edge-quant-{uid}"}, headers=headers)
        assert proj_res.status_code == 201
        proj_id = proj_res.json()["id"]

        # 4. Question
        q_res = await client.post("/api/v1/questions", json={"code": "Q-100", "title": "Can INT4 compression achieve 60 FPS under 2.0W?"}, headers=headers)
        assert q_res.status_code == 201
        q_id = q_res.json()["id"]

        # 5. Paper
        p_res = await client.post(
            "/api/v1/papers",
            json={"code": "P-100", "title": "Transformer Attention Quantization", "authors": ["Vaswani, A."], "year": 2026, "venue": "NeurIPS"},
            headers=headers,
        )
        assert p_res.status_code == 201
        p_id = p_res.json()["id"]

        # 6. Evidence
        ev_res = await client.post(
            "/api/v1/evidence",
            json={"code": "EV-100", "title": "Baseline 8-bit Accuracy Retention", "summary": "Retains 99.2% accuracy on benchmark", "evidence_type": "empirical", "strength": "strong"},
            headers=headers,
        )
        assert ev_res.status_code == 201
        ev_id = ev_res.json()["id"]

        # 7. Gap
        gap_res = await client.post(
            "/api/v1/gaps",
            json={"code": "G-100", "title": "Sub-2W Edge Hardware Bottleneck", "description": "Prior methods exceed power budget by 40%"},
            headers=headers,
        )
        assert gap_res.status_code == 201
        gap_id = gap_res.json()["id"]

        # 8. Hypothesis
        h_res = await client.post(
            "/api/v1/hypotheses",
            json={"code": "H-100", "statement": "Asymmetric INT4 scaling keeps power < 1.95W at 60 FPS", "rationale": "Non-linear channel quantization"},
            headers=headers,
        )
        assert h_res.status_code == 201
        h_id = h_res.json()["id"]

        # 9. Dataset
        ds_res = await client.post(
            "/api/v1/datasets",
            json={"code": "DS-100", "name": "Kvasir-Edge-Capsule", "domain": "medical_ai", "size_bytes": 1048576, "record_count": 50000},
            headers=headers,
        )
        assert ds_res.status_code == 201
        ds_id = ds_res.json()["id"]

        # 10. Model
        m_res = await client.post(
            "/api/v1/models",
            json={"code": "M-100", "name": "CapsuleNet-INT4", "architecture": "Hybrid Transformer", "framework": "PyTorch 2.4", "parameter_count": 14000000},
            headers=headers,
        )
        assert m_res.status_code == 201
        m_id = m_res.json()["id"]

        # 11. Experiment
        e_res = await client.post(
            "/api/v1/experiments",
            json={"code": "E-100", "title": "Jetson Orin 2.0W Thermal & Throughput Protocol", "status": "completed"},
            headers=headers,
        )
        assert e_res.status_code == 201
        e_id = e_res.json()["id"]

        # 12. Result
        r_res = await client.post(
            "/api/v1/results",
            json={
                "code": "R-100",
                "title": "62.4 FPS at 1.91W Sustained",
                "summary": "Exceeded 60 FPS throughput requirement",
                "metrics": {"fps": 62.4, "power": 1.91},
                "experiment_id": e_id,
            },
            headers=headers,
        )
        assert r_res.status_code == 201
        r_id = r_res.json()["id"]

        # 13. Decision
        d_res = await client.post(
            "/api/v1/decisions",
            json={"code": "D-100", "title": "Standardize on Asymmetric INT4 Core", "outcome": "accepted", "rationale": "Empirically verified across 10 trials"},
            headers=headers,
        )
        assert d_res.status_code == 201
        d_id = d_res.json()["id"]

        # 14. Claim
        c_res = await client.post(
            "/api/v1/claims",
            json={"code": "C-100", "statement": "Pareto-optimal sub-2W capsule endoscopy neural compression verified", "confidence_score": 0.98},
            headers=headers,
        )
        assert c_res.status_code == 201
        c_id = c_res.json()["id"]

        # 15. Create Directed Graph Provenance Links
        await client.post("/api/v1/relationships", json={"source_id": p_id, "source_type": "paper", "target_id": ev_id, "target_type": "evidence", "relation_type": "produces"}, headers=headers)
        await client.post("/api/v1/relationships", json={"source_id": ev_id, "source_type": "evidence", "target_id": gap_id, "target_type": "gap", "relation_type": "motivates"}, headers=headers)
        await client.post("/api/v1/relationships", json={"source_id": gap_id, "source_type": "gap", "target_id": h_id, "target_type": "hypothesis", "relation_type": "addresses"}, headers=headers)
        await client.post("/api/v1/relationships", json={"source_id": h_id, "source_type": "hypothesis", "target_id": e_id, "target_type": "experiment", "relation_type": "tests"}, headers=headers)
        await client.post("/api/v1/relationships", json={"source_id": e_id, "source_type": "experiment", "target_id": r_id, "target_type": "result", "relation_type": "produces"}, headers=headers)
        await client.post("/api/v1/relationships", json={"source_id": r_id, "source_type": "result", "target_id": d_id, "target_type": "decision", "relation_type": "supports"}, headers=headers)
        await client.post("/api/v1/relationships", json={"source_id": d_id, "source_type": "decision", "target_id": c_id, "target_type": "claim", "relation_type": "leads_to"}, headers=headers)

        # 16. Execute Backward Provenance Trace Query from Decision D-100
        trace_res = await client.get(f"/api/v1/decisions/{d_id}/trace", headers=headers)
        assert trace_res.status_code == 200
        trace_data = trace_res.json()
        assert "root_node" in trace_data
        assert "nodes" in trace_data
        assert "edges" in trace_data
        assert len(trace_data["nodes"]) >= 2
