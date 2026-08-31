import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_manuscript_export_and_bibtex():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_id = uuid.uuid4().hex[:8]
        user_email = f"author_{unique_id}@lab.org"
        user_password = "AuthorPassword123!"

        # 1. Register & Login
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={
                "email": user_email,
                "password": user_password,
                "full_name": f"Dr. Author {unique_id}",
            },
        )
        assert reg_res.status_code == 201
        token = reg_res.json()["tokens"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Workspace
        ws_res = await client.post(
            "/api/v1/workspaces",
            json={
                "name": f"Publication Lab {unique_id}",
                "description": "Workspace for publication engine verification",
            },
            headers=headers,
        )
        assert ws_res.status_code == 201
        ws_id = ws_res.json()["id"]
        headers["X-Workspace-Id"] = ws_id

        # 3. Export Manuscript
        export_res = await client.post(
            "/api/v1/manuscripts/export",
            json={
                "target_format": "markdown",
                "template_style": "ieee_two_column",
                "include_traceability_matrix": True,
            },
            headers=headers,
        )
        assert export_res.status_code == 200
        data = export_res.json()
        assert "markdown_source" in data
        assert "latex_source" in data
        assert "evidence_traceability_matrix" in data
        assert len(data["sections"]) >= 4

        # 4. Get BibTeX
        bibtex_res = await client.get("/api/v1/manuscripts/bibtex", headers=headers)
        assert bibtex_res.status_code == 200

        # 5. Get LaTeX
        latex_res = await client.get("/api/v1/manuscripts/latex", headers=headers)
        assert latex_res.status_code == 200
