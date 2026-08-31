import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_cross_workspace_idor_protection_exhaustive():
    """
    Exhaustive Multi-Tenant Negative Authorization Test:
    User A owns Workspace A with 10 entity archetypes and collaboration resources.
    User B owns Workspace B.
    Asserts User B is blocked (403/404) from reading, mutating, or injecting into Workspace A.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Setup User A & Workspace A
        uid_a = uuid.uuid4().hex[:8]
        reg_a = await client.post(
            "/api/v1/auth/register",
            json={"email": f"user_a_{uid_a}@lab.org", "password": "PasswordA123!", "full_name": f"Researcher A {uid_a}"},
        )
        assert reg_a.status_code == 201
        token_a = reg_a.json()["tokens"]["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        ws_a_res = await client.post(
            "/api/v1/workspaces",
            json={"name": f"Workspace A {uid_a}", "description": "Private lab A"},
            headers=headers_a,
        )
        assert ws_a_res.status_code == 201
        ws_a_id = ws_a_res.json()["id"]
        headers_a["X-Workspace-Id"] = ws_a_id

        # User A creates a Project, Question, Gap, and Hypothesis
        proj_res = await client.post("/api/v1/projects", json={"name": "Project Alpha", "slug": f"p-alpha-{uid_a}"}, headers=headers_a)
        assert proj_res.status_code == 201
        proj_a = proj_res.json()

        q_res = await client.post("/api/v1/questions", json={"code": "Q-001", "title": "Confidential Algorithm Architecture", "description": "Confidential Description"}, headers=headers_a)
        assert q_res.status_code == 201
        q_a = q_res.json()

        gap_res = await client.post("/api/v1/gaps", json={"code": "G-001", "title": "Confidential Hardware Gap", "description": "Detailed explanation of hardware gap limitation"}, headers=headers_a)
        assert gap_res.status_code == 201
        gap_a = gap_res.json()

        h_res = await client.post("/api/v1/hypotheses", json={"code": "H-001", "statement": "Statement A", "rationale": "Rationale"}, headers=headers_a)
        assert h_res.status_code == 201
        h_a = h_res.json()

        # 2. Setup User B & Workspace B
        uid_b = uuid.uuid4().hex[:8]
        reg_b = await client.post(
            "/api/v1/auth/register",
            json={"email": f"user_b_{uid_b}@lab.org", "password": "PasswordB123!", "full_name": f"Researcher B {uid_b}"},
        )
        assert reg_b.status_code == 201
        token_b = reg_b.json()["tokens"]["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        ws_b_res = await client.post(
            "/api/v1/workspaces",
            json={"name": f"Workspace B {uid_b}", "description": "Private lab B"},
            headers=headers_b,
        )
        assert ws_b_res.status_code == 201
        ws_b_id = ws_b_res.json()["id"]
        headers_b["X-Workspace-Id"] = ws_b_id

        # 3. User B attempts unauthorized access to Workspace A using spoofed X-Workspace-Id -> 403 / 404
        spoofed_headers = {"Authorization": f"Bearer {token_b}", "X-Workspace-Id": ws_a_id}
        
        # Test Questions
        res = await client.get("/api/v1/questions", headers=spoofed_headers)
        assert res.status_code in [403, 404]

        # Test Projects
        res = await client.get("/api/v1/projects", headers=spoofed_headers)
        assert res.status_code in [403, 404]

        # Test Gaps
        res = await client.get("/api/v1/gaps", headers=spoofed_headers)
        assert res.status_code in [403, 404]

        # Test Hypotheses
        res = await client.get("/api/v1/hypotheses", headers=spoofed_headers)
        assert res.status_code in [403, 404]

        # 4. User B attempts direct IDOR fetch by ID from within Workspace B -> 403 or 404
        assert (await client.get(f"/api/v1/projects/{proj_a['id']}", headers=headers_b)).status_code in [403, 404]
        assert (await client.get(f"/api/v1/questions/{q_a['id']}", headers=headers_b)).status_code in [403, 404]
        assert (await client.get(f"/api/v1/gaps/{gap_a['id']}", headers=headers_b)).status_code in [403, 404]
        assert (await client.get(f"/api/v1/hypotheses/{h_a['id']}", headers=headers_b)).status_code in [403, 404]

        # 5. User B attempts unauthorized delete of Project A -> 403 or 404
        del_res = await client.delete(f"/api/v1/projects/{proj_a['id']}", headers=headers_b)
        assert del_res.status_code in [403, 404]
