import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_project_crud_and_workspace_isolation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register User A
        uid_a = uuid.uuid4().hex[:8]
        reg_a = await client.post(
            "/api/v1/auth/register",
            json={"email": f"proj_user_a_{uid_a}@test.org", "password": "Password123!", "full_name": "Project User A"},
        )
        assert reg_a.status_code == 201
        data_a = reg_a.json()
        token_a = data_a["tokens"]["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Get User A's workspace
        ws_res_a = await client.get("/api/v1/workspaces", headers=headers_a)
        assert ws_res_a.status_code == 200
        workspaces_a = ws_res_a.json()
        assert len(workspaces_a) >= 1
        ws_id_a = workspaces_a[0]["id"]
        headers_a["X-Workspace-Id"] = ws_id_a

        # 3. Create Project in Workspace A
        create_p_res = await client.post(
            f"/api/v1/workspaces/{ws_id_a}/projects",
            headers=headers_a,
            json={
                "name": "Endoscopic Model Pruning",
                "research_area": "Medical AI",
                "description": "Depth-reduced CNN models for wireless capsule endoscopy",
                "status": "active",
            },
        )
        assert create_p_res.status_code == 201
        p_data = create_p_res.json()
        assert p_data["name"] == "Endoscopic Model Pruning"
        assert p_data["slug"] == "endoscopic-model-pruning"
        assert p_data["research_area"] == "Medical AI"
        project_id = p_data["id"]

        # 4. List projects in Workspace A
        list_p_res = await client.get(f"/api/v1/workspaces/{ws_id_a}/projects", headers=headers_a)
        assert list_p_res.status_code == 200
        projects_list = list_p_res.json()
        assert len(projects_list) >= 1
        assert any(p["id"] == project_id for p in projects_list)

        # 5. Get project by ID
        get_p_res = await client.get(f"/api/v1/projects/{project_id}", headers=headers_a)
        assert get_p_res.status_code == 200
        assert get_p_res.json()["name"] == "Endoscopic Model Pruning"

        # 6. Update project
        up_res = await client.put(
            f"/api/v1/projects/{project_id}",
            headers=headers_a,
            json={"research_area": "Clinical AI & Computer Vision"},
        )
        assert up_res.status_code == 200
        assert up_res.json()["research_area"] == "Clinical AI & Computer Vision"

        # 7. User B isolation check: User B cannot access Workspace A's projects
        uid_b = uuid.uuid4().hex[:8]
        reg_b = await client.post(
            "/api/v1/auth/register",
            json={"email": f"proj_user_b_{uid_b}@test.org", "password": "Password123!", "full_name": "Project User B"},
        )
        assert reg_b.status_code == 201
        token_b = reg_b.json()["tokens"]["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User B cannot list projects of Workspace A
        forbidden_list = await client.get(f"/api/v1/workspaces/{ws_id_a}/projects", headers=headers_b)
        assert forbidden_list.status_code == 403

        # User B cannot get Project of Workspace A
        forbidden_get = await client.get(f"/api/v1/projects/{project_id}", headers=headers_b)
        assert forbidden_get.status_code == 403
