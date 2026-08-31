import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_integrations_e2e_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_id = uuid.uuid4().hex[:8]
        user_email = f"integrator_{unique_id}@lab.org"
        user_password = "IntegratorPassword123!"

        # 1. Register & Login
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={
                "email": user_email,
                "password": user_password,
                "full_name": f"Dr. Integrator {unique_id}",
            },
        )
        assert reg_res.status_code == 201
        token = reg_res.json()["tokens"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Workspace
        ws_res = await client.post(
            "/api/v1/workspaces",
            json={
                "name": f"Integration Lab {unique_id}",
                "description": "Workspace for multi-source adapter verification",
            },
            headers=headers,
        )
        assert ws_res.status_code == 201
        ws_id = ws_res.json()["id"]
        headers["X-Workspace-Id"] = ws_id

        # 3. List Integrations
        list_res = await client.get("/api/v1/integrations", headers=headers)
        assert list_res.status_code == 200
        data = list_res.json()
        assert len(data) >= 3
        providers = [item["provider"] for item in data]
        assert "github" in providers
        assert "mlflow" in providers
        assert "zotero" in providers

        # 4. Import BibTeX entry
        bibtex_sample = """
        @article{smith2026deep,
          title={Deep Neural Compression for Wireless Capsule Endoscopy},
          author={Smith, Alice and Doe, John},
          journal={IEEE Transactions on Medical Imaging},
          year={2026},
          doi={10.1109/TMI.2026.123456}
        }
        """
        bib_res = await client.post(
            "/api/v1/integrations/bibtex-import",
            json={"bibtex_content": bibtex_sample, "auto_create_evidence": True},
            headers=headers,
        )
        assert bib_res.status_code == 200
        bib_data = bib_res.json()
        assert bib_data["total_parsed"] == 1
        assert len(bib_data["imported_papers"]) == 1
        assert len(bib_data["imported_evidence"]) == 1
        assert bib_data["imported_papers"][0]["title"] == "Deep Neural Compression for Wireless Capsule Endoscopy"

        # 5. Create an Experiment and sync MLflow telemetry
        exp_res = await client.post(
            "/api/v1/experiments",
            json={
                "code": f"E-{unique_id[:4].upper()}",
                "title": "Edge Benchmark Protocol",
                "description": "Testing INT4 quantization throughput on Jetson Orin",
                "status": "planned",
            },
            headers=headers,
        )
        assert exp_res.status_code == 201
        exp_id = exp_res.json()["id"]

        mlflow_res = await client.post(
            "/api/v1/integrations/mlflow-sync",
            json={
                "experiment_id": exp_id,
                "run_id": f"run-{unique_id}",
                "run_name": "int4_quantization_trial_01",
                "metrics": {
                    "throughputFps": 62.5,
                    "powerWatts": 1.95,
                    "auc": 0.962,
                },
            },
            headers=headers,
        )
        assert mlflow_res.status_code == 200
        mlflow_data = mlflow_res.json()
        assert mlflow_data["linked_metrics_count"] == 3
        assert mlflow_data["status"] == "synchronized"

        # 6. Verify GitHub sync
        gh_res = await client.post(
            "/api/v1/integrations/github-sync",
            json={
                "repo_url": "https://github.com/Vishaldave45/research-os",
                "commit_hash": "3b1d946e123456",
                "branch": "dev",
                "link_to_experiment_id": exp_id,
            },
            headers=headers,
        )
        assert gh_res.status_code == 200
        assert gh_res.json()["status"] == "verified"
