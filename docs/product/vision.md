# ResearchOS — Product Vision & Core Architecture

## Executive Summary
**ResearchOS** is an operating system for high-stakes scientific reasoning, literature synthesis, and empirical provenance. It models scientific exploration as a **strongly-typed, directed acyclic reasoning graph (DAG)**.

## Core Problem
In traditional research workflows, provenance is fragmented across reference managers (Zotero), notebooks (Jupyter, Colab), experiment trackers (MLflow, W&B), and manuscripts (LaTeX, Overleaf). ResearchOS bridges this gap by maintaining the connective tissue between literature, questions, hypotheses, experiments, results, decisions, and claims.

## Architectural Tenets
1. **Modular Monolith First**: A single, clean, highly modular FastAPI backend paired with a modern React + TypeScript frontend.
2. **PostgreSQL as Source of Truth**: All domain entities and directed DAG relationships are strictly persisted in PostgreSQL with ACID guarantees and multi-tenant row-level isolation.
3. **Traceability as First-Class Citizen**: Every scientific assertion or architectural decision can be deterministically traced backward to its empirical evidence and literature roots.
4. **AI as an Evidence-Grounded Reasoning Layer**: AI generates proposals and audits evidence, but never invents ground truth or creates unapproved entities.
