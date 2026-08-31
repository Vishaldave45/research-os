#!/usr/bin/env python3
"""
ResearchOS ExperimentOS Ingestion CLI
Ingests real PyTorch / Torchvision / ML experiment results directly into PostgreSQL via FastAPI (/api/v1).
Establishes the scientific link: Hypothesis -> Experiment -> Model -> Result.
"""
import os
import sys
import json
import argparse
import urllib.request
import urllib.error

def post_json(url: str, data: dict, token: str, workspace_id: str):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "X-Workspace-Id": workspace_id,
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"HTTP Error {e.code}: {err_msg}", file=sys.stderr)
        raise

def main():
    parser = argparse.ArgumentParser(description="Ingest an empirical deep learning run into ResearchOS")
    parser.add_argument("--api-url", default="http://localhost:8001/api/v1", help="ResearchOS API Base URL")
    parser.add_argument("--token", required=True, help="User JWT access token")
    parser.add_argument("--workspace-id", required=True, help="Target Workspace ID")
    parser.add_argument("--hypothesis-id", required=True, help="Hypothesis UUID to ground this experiment")
    parser.add_argument("--run-file", required=True, help="Path to JSON results file containing metrics, config, and artifacts")
    
    args = parser.parse_args()

    with open(args.run_file, "r") as f:
        run_data = json.load(f)

    print(f"🚀 Ingesting Experiment: {run_data.get('title', 'Empirical Run')} into ResearchOS...")

    # 1. Create Model Registry record
    model_payload = {
        "name": run_data["model"]["name"],
        "slug": run_data["model"]["slug"],
        "architecture": run_data["model"]["architecture"],
        "parameter_count": run_data["model"]["parameter_count"],
        "code_commit_hash": run_data["model"].get("commit_hash", "main@HEAD"),
        "hyperparameters": run_data.get("config", {}),
    }
    model_res = post_json(f"{args.api_url}/models", model_payload, args.token, args.workspace_id)
    model_id = model_res["id"]
    print(f"✓ Model Registered: {model_res['name']} ({model_id})")

    # 2. Create Experiment record
    exp_payload = {
        "code": run_data.get("experiment_code", "E-003"),
        "title": run_data["title"],
        "description": run_data.get("description", ""),
        "status": "completed",
        "config": {
            **run_data.get("config", {}),
            "model_id": model_id,
            "seed": run_data.get("seed", 42),
            "hardware": run_data.get("hardware", "NVIDIA RTX 4090 / Embedded Jetson Orin"),
        },
        "execution_metadata": {
            "duration_seconds": run_data.get("duration_seconds", 3600),
            "framework": "PyTorch 2.4 / Torchvision",
            "git_commit": run_data.get("git_commit", "main@HEAD"),
        },
    }
    exp_res = post_json(f"{args.api_url}/experiments", exp_payload, args.token, args.workspace_id)
    exp_id = exp_res["id"]
    print(f"✓ Experiment Created: {exp_res['code']} - {exp_res['title']} ({exp_id})")

    # 3. Create Result record
    result_payload = {
        "code": run_data.get("result_code", "R-003"),
        "title": f"Empirical Evaluation: {run_data['title']}",
        "summary": run_data.get("summary", "Standardized benchmark run on target dataset."),
        "metrics": run_data["metrics"],
        "artifacts": run_data.get("artifacts", []),
        "status": "valid",
    }
    res_res = post_json(f"{args.api_url}/results", result_payload, args.token, args.workspace_id)
    result_id = res_res["id"]
    print(f"✓ Empirical Result Logged: {res_res['code']} ({result_id})")

    # 4. Link Hypothesis -> Experiment and Experiment -> Result
    post_json(
        f"{args.api_url}/relationships",
        {
            "source_type": "hypothesis",
            "source_id": args.hypothesis_id,
            "target_type": "experiment",
            "target_id": exp_id,
            "relation_type": "tests",
        },
        args.token,
        args.workspace_id,
    )
    print(f"✓ Provenance Edge: Hypothesis [{args.hypothesis_id}] -> tests -> Experiment [{exp_id}]")

    post_json(
        f"{args.api_url}/relationships",
        {
            "source_type": "experiment",
            "source_id": exp_id,
            "target_type": "result",
            "target_id": result_id,
            "relation_type": "produces",
        },
        args.token,
        args.workspace_id,
    )
    print(f"✓ Provenance Edge: Experiment [{exp_id}] -> produces -> Result [{result_id}]")

    print("\n🎉 Run successfully ingested with full provenance lineage in PostgreSQL!")

if __name__ == "__main__":
    main()
