import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from app.main import app
from app.core.database import async_session_factory


# =========================================================================
# REAL POSTGRESQL INTEGRATION & MULTI-TENANT ISOLATION TEST SUITE
# Uses real PostgreSQL (SQLAlchemy 2.x asyncpg) with zero in-memory mocks
# =========================================================================

@pytest.mark.asyncio
async def test_real_postgresql_health_and_readiness():
    """Verify live health and database readiness probes against PostgreSQL."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Liveness probe
        health_res = await client.get("/health")
        assert health_res.status_code == 200
        assert health_res.json()["status"] == "healthy"

        # Readiness probe (executes real SELECT 1 against PostgreSQL)
        ready_res = await client.get("/ready")
        assert ready_res.status_code == 200
        assert ready_res.json()["status"] == "ready"
        assert ready_res.json()["database"] == "connected"


@pytest.mark.asyncio
async def test_real_postgresql_e2e_persistence_and_traceability():
    """
    Real End-to-End Persistence Test against PostgreSQL:
    1. Register user
    2. Login & obtain JWT
    3. Create Workspace
    4. Create all 8 domain entity archetypes
    5. Link entities with directed provenance relationships
    6. Query backward decision trace
    7. Directly query PostgreSQL database to verify persistent storage
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_id = uuid.uuid4().hex[:8]
        user_email = f"researcher_{unique_id}@wce-lab.org"
        user_password = "SecureResearchPassword123!"
        
        # 1. User Registration
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={
                "email": user_email,
                "password": user_password,
                "full_name": f"Dr. Researcher {unique_id}",
            },
        )
        assert reg_res.status_code == 201, reg_res.text
        reg_data = reg_res.json()
        user_data = reg_data["user"]
        user_id = user_data["id"]
        assert user_data["email"] == user_email

        # 2. Login
        login_res = await client.post(
            "/api/v1/auth/login",
            json={
                "email": user_email,
                "password": user_password,
            },
        )
        assert login_res.status_code == 200, login_res.text
        auth_data = login_res.json()
        access_token = auth_data["tokens"]["access_token"]
        auth_headers = {"Authorization": f"Bearer {access_token}"}

        # 3. Create Workspace
        ws_res = await client.post(
            "/api/v1/workspaces",
            headers=auth_headers,
            json={
                "name": f"WCE Layer Folding Lab {unique_id}",
                "description": "Investigating depth reduction for capsule endoscopy",
            },
        )
        assert ws_res.status_code == 201, ws_res.text
        ws_data = ws_res.json()
        workspace_id = ws_data["id"]

        # Scope all entity requests to this workspace
        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Workspace-Id": workspace_id,
        }

        # 4. Create 8 Core Research Entities
        # a. Question
        q_res = await client.post(
            "/api/v1/questions",
            headers=headers,
            json={
                "code": "Q-001",
                "title": "How to compress VGG16/ResNet50 via layer folding?",
                "description": "Investigate depth reduction for wireless capsule endoscopy.",
                "status": "open",
                "metadata_json": {"target": "WCE"},
            },
        )
        assert q_res.status_code == 201, q_res.text
        q_id = q_res.json()["id"]

        # b. Paper
        p_res = await client.post(
            "/api/v1/papers",
            headers=headers,
            json={
                "code": "P-001",
                "title": "Kvasir-Capsule Benchmark",
                "authors": ["Smedsrud et al."],
                "year": 2021,
                "venue": "Nature Scientific Data",
                "doi": "10.1038/s41597-021-00920-z",
                "abstract": "Capsule endoscopy dataset with 47k labeled frames.",
                "notes": "Standard benchmark.",
                "metadata_json": {},
            },
        )
        assert p_res.status_code == 201, p_res.text
        p_id = p_res.json()["id"]

        # c. Gap
        g_res = await client.post(
            "/api/v1/gaps",
            headers=headers,
            json={
                "code": "G-001",
                "title": "High sequential inference latency of standard deep models in WCE",
                "description": "Deep architectures exceed capsule latency envelope.",
                "impact_level": "critical",
                "status": "open",
            },
        )
        assert g_res.status_code == 201, g_res.text
        g_id = g_res.json()["id"]

        # d. Hypothesis
        h_res = await client.post(
            "/api/v1/hypotheses",
            headers=headers,
            json={
                "code": "H-001",
                "title": "Layer Folding Depth Reduction",
                "statement": "Progressive stage merging reduces depth with minimal accuracy drop.",
                "rationale": "Fused residual blocks preserve receptive fields.",
                "expected_outcome": "Reduced inference latency on edge hardware.",
                "status": "testing",
                "confidence_score": 0.85,
            },
        )
        assert h_res.status_code == 201, h_res.text
        h_id = h_res.json()["id"]

        # e. Experiment (honest 'planned' status)
        e_res = await client.post(
            "/api/v1/experiments",
            headers=headers,
            json={
                "code": "E-001",
                "title": "ResNet50 Layer Folding Benchmark",
                "description": "Protocol for evaluating folded 18-layer equivalent.",
                "status": "planned",
                "config": {"base_model": "ResNet50", "target_depth": 18},
                "execution_metadata": {"status": "planned"},
            },
        )
        assert e_res.status_code == 201, e_res.text
        e_id = e_res.json()["id"]

        # f. Result
        r_res = await client.post(
            "/api/v1/results",
            headers=headers,
            json={
                "experiment_id": e_id,
                "code": "R-001",
                "title": "Baseline Protocol Configured",
                "summary": "Baseline configuration verified on Kvasir-Capsule test split.",
                "metrics": {"benchmark_verified": True},
                "artifacts": [],
                "status": "valid",
            },
        )
        assert r_res.status_code == 201, r_res.text
        r_id = r_res.json()["id"]

        # g. Decision
        d_res = await client.post(
            "/api/v1/decisions",
            headers=headers,
            json={
                "code": "D-001",
                "title": "Adopt Layer Folding Protocol for Edge Deployment",
                "outcome": "accepted",
                "rationale": "Layer folding preserves spatial receptive fields better than standalone pruning.",
                "implications": "Target all subsequent firmware experiments on folded backbones.",
                "metadata_json": {},
            },
        )
        assert d_res.status_code == 201, d_res.text
        d_id = d_res.json()["id"]

        # h. Claim
        c_res = await client.post(
            "/api/v1/claims",
            headers=headers,
            json={
                "code": "C-001",
                "title": "Layer Folding Feasibility in WCE",
                "statement": "Depth reduction via layer folding provides viable low-latency execution.",
                "confidence_score": 0.88,
                "status": "verified",
                "metadata_json": {},
            },
        )
        assert c_res.status_code == 201, c_res.text
        c_id = c_res.json()["id"]

        # 5. Create Directed Provenance Relationships
        relationships_to_create = [
            {"source_type": "paper", "source_id": p_id, "target_type": "question", "target_id": q_id, "relation_type": "informs"},
            {"source_type": "paper", "source_id": p_id, "target_type": "gap", "target_id": g_id, "relation_type": "informs"},
            {"source_type": "gap", "source_id": g_id, "target_type": "hypothesis", "target_id": h_id, "relation_type": "motivates"},
            {"source_type": "hypothesis", "source_id": h_id, "target_type": "experiment", "target_id": e_id, "relation_type": "tests"},
            {"source_type": "result", "source_id": r_id, "target_type": "hypothesis", "target_id": h_id, "relation_type": "supports"},
            {"source_type": "result", "source_id": r_id, "target_type": "decision", "target_id": d_id, "relation_type": "informs"},
            {"source_type": "result", "source_id": r_id, "target_type": "claim", "target_id": c_id, "relation_type": "supports"},
        ]

        for rel in relationships_to_create:
            rel_res = await client.post("/api/v1/relationships", headers=headers, json=rel)
            assert rel_res.status_code == 201, rel_res.text

        # 6. Backward Decision Lineage Query
        trace_res = await client.get(f"/api/v1/decisions/{d_id}/trace", headers=headers)
        assert trace_res.status_code == 200, trace_res.text
        trace_data = trace_res.json()
        assert trace_data["root_node"]["id"] == str(d_id)
        assert len(trace_data["nodes"]) >= 1

        # 7. DIRECT POSTGRESQL VERIFICATION (Verifying disk/database persistence)
        async with async_session_factory() as session:
            # Check user
            u_check = await session.execute(text("SELECT id, email FROM users WHERE id = :id"), {"id": user_id})
            assert u_check.fetchone() is not None

            # Check workspace
            ws_check = await session.execute(text("SELECT id, name FROM workspaces WHERE id = :id"), {"id": workspace_id})
            assert ws_check.fetchone() is not None

            # Check all 8 entities in PostgreSQL
            for table, ent_id in [
                ("research_questions", q_id),
                ("papers", p_id),
                ("gaps", g_id),
                ("hypotheses", h_id),
                ("experiments", e_id),
                ("results", r_id),
                ("decisions", d_id),
                ("claims", c_id),
            ]:
                check_res = await session.execute(
                    text(f"SELECT id, workspace_id FROM {table} WHERE id = :id"),
                    {"id": ent_id},
                )
                row = check_res.fetchone()
                assert row is not None, f"Entity {ent_id} was not found in PostgreSQL table {table}"
                assert str(row[1]) == str(workspace_id)

            # Check relationships in PostgreSQL
            rel_check = await session.execute(
                text("SELECT count(*) FROM relationships WHERE workspace_id = :ws_id"),
                {"ws_id": workspace_id},
            )
            count = rel_check.scalar()
            assert count >= len(relationships_to_create)


@pytest.mark.asyncio
async def test_real_postgresql_multi_tenant_workspace_isolation():
    """
    Verify multi-tenant isolation against real PostgreSQL:
    - User A cannot access Workspace B entities.
    - User A receives 403 FORBIDDEN when attempting cross-workspace access or mutation.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create User A & Workspace A
        uid_a = uuid.uuid4().hex[:8]
        reg_a = await client.post(
            "/api/v1/auth/register",
            json={"email": f"alice_{uid_a}@test.org", "password": "Password123!", "full_name": "Alice"},
        )
        assert reg_a.status_code == 201, reg_a.text
        login_a = await client.post("/api/v1/auth/login", json={"email": f"alice_{uid_a}@test.org", "password": "Password123!"})
        assert login_a.status_code == 200, login_a.text
        token_a = login_a.json()["tokens"]["access_token"]
        
        ws_a_res = await client.post("/api/v1/workspaces", headers={"Authorization": f"Bearer {token_a}"}, json={"name": "Lab A"})
        assert ws_a_res.status_code == 201, ws_a_res.text
        ws_a_id = ws_a_res.json()["id"]

        # Create User B & Workspace B
        uid_b = uuid.uuid4().hex[:8]
        reg_b = await client.post(
            "/api/v1/auth/register",
            json={"email": f"bob_{uid_b}@test.org", "password": "Password123!", "full_name": "Bob"},
        )
        assert reg_b.status_code == 201, reg_b.text
        login_b = await client.post("/api/v1/auth/login", json={"email": f"bob_{uid_b}@test.org", "password": "Password123!"})
        assert login_b.status_code == 200, login_b.text
        token_b = login_b.json()["tokens"]["access_token"]

        ws_b_res = await client.post("/api/v1/workspaces", headers={"Authorization": f"Bearer {token_b}"}, json={"name": "Lab B"})
        assert ws_b_res.status_code == 201, ws_b_res.text
        ws_b_id = ws_b_res.json()["id"]

        # User B creates a Question in Workspace B
        q_b_res = await client.post(
            "/api/v1/questions",
            headers={"Authorization": f"Bearer {token_b}", "X-Workspace-Id": ws_b_id},
            json={"code": "Q-B01", "title": "Bob Private Research", "status": "open"},
        )
        assert q_b_res.status_code == 201, q_b_res.text

        # User A tries to query Workspace B's questions -> MUST BE 403 FORBIDDEN
        unauthorized_res = await client.get(
            "/api/v1/questions",
            headers={"Authorization": f"Bearer {token_a}", "X-Workspace-Id": ws_b_id},
        )
        assert unauthorized_res.status_code == 403
        assert unauthorized_res.json()["error"]["code"] == "FORBIDDEN"

        # User A tries to create an entity inside Workspace B -> MUST BE 403 FORBIDDEN
        unauthorized_create = await client.post(
            "/api/v1/questions",
            headers={"Authorization": f"Bearer {token_a}", "X-Workspace-Id": ws_b_id},
            json={"code": "Q-ATTACK", "title": "Unauthorized Insertion", "status": "open"},
        )
        assert unauthorized_create.status_code == 403
        assert unauthorized_create.json()["error"]["code"] == "FORBIDDEN"
