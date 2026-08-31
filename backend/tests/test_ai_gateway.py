import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_ai_copilot_query_grounded_e2e():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_id = uuid.uuid4().hex[:8]
        user_email = f"ai_user_{unique_id}@lab.org"
        user_password = "AiUserPassword123!"

        # 1. Register & Login
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={
                "email": user_email,
                "password": user_password,
                "full_name": f"Dr. AI Researcher {unique_id}",
            },
        )
        assert reg_res.status_code == 201
        token = reg_res.json()["tokens"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Workspace
        ws_res = await client.post(
            "/api/v1/workspaces",
            json={
                "name": f"AI Copilot Lab {unique_id}",
                "description": "Workspace for AI copilot verification",
            },
            headers=headers,
        )
        assert ws_res.status_code == 201
        ws_id = ws_res.json()["id"]
        headers["X-Workspace-Id"] = ws_id

        # 3. Create a Question and Hypothesis
        await client.post(
            "/api/v1/questions",
            json={
                "code": "Q-001",
                "title": "Can INT4 quantization achieve real-time 45 FPS on edge silicon?",
                "description": "Evaluating inference throughput within 2.5W envelope",
            },
            headers=headers,
        )

        await client.post(
            "/api/v1/hypotheses",
            json={
                "code": "H-001",
                "title": "INT4 Asymmetric Quantization Hypothesis",
                "statement": "INT4 asymmetric quantization maintains >0.95 AUC while doubling FPS",
                "rationale": "Quantization noise is absorbed by early conv layers",
            },
            headers=headers,
        )

        # 4. Query AI Copilot
        copilot_res = await client.post(
            "/api/v1/ai/copilot/query",
            json={
                "query": "What evidence or hypotheses do we have for edge neural compression?",
                "provider": "local",
            },
            headers=headers,
        )
        assert copilot_res.status_code == 200
        data = copilot_res.json()
        assert "answer" in data
        assert len(data["citations"]) >= 2
        assert data["grounded_context_length"] > 0
        assert data["provider"] == "local"
