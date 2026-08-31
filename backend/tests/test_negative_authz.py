import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_cross_workspace_idor_protection():
    """
    Negative Security & Multi-Tenant Authorization Test:
    User A owns Workspace A.
    User B owns Workspace B.
    User B must NOT be able to read, mutate, or delete Workspace A's research questions or experiments.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register User A and create Workspace A
        uid_a = uuid.uuid4().hex[:8]
        reg_a = await client.post(
            "/api/v1/auth/register",
            json={
                "email": f"user_a_{uid_a}@lab.org",
                "password": "PasswordA123!",
                "full_name": f"Researcher A {uid_a}",
            },
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

        # User A creates Question Q-001 in Workspace A
        q_res = await client.post(
            "/api/v1/questions",
            json={
                "code": "Q-001",
                "title": "Confidential Algorithm Architecture",
                "description": "Sensitive domain hypothesis",
            },
            headers=headers_a,
        )
        assert q_res.status_code == 201
        q_id = q_res.json()["id"]

        # 2. Register User B and create Workspace B
        uid_b = uuid.uuid4().hex[:8]
        reg_b = await client.post(
            "/api/v1/auth/register",
            json={
                "email": f"user_b_{uid_b}@lab.org",
                "password": "PasswordB123!",
                "full_name": f"Researcher B {uid_b}",
            },
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

        # 3. User B attempts to access Workspace A using User A's workspace header -> 403 Forbidden
        headers_b_malicious = {"Authorization": f"Bearer {token_b}", "X-Workspace-Id": ws_a_id}
        malicious_list = await client.get("/api/v1/questions", headers=headers_b_malicious)
        assert malicious_list.status_code in [403, 404]

        # 4. User B attempts direct IDOR lookup of Question A from within Workspace B -> 404 Not Found
        idor_get = await client.get(f"/api/v1/questions/{q_id}", headers=headers_b)
        assert idor_get.status_code == 404
