# ADR-0001: Modular Monolith Architecture First

## Status
Accepted

## Context
Scientific research platforms require tight consistency between research questions, literature citations, datasets, hypotheses, experiments, metrics, decisions, and claims. Prematurely splitting the system into microservices creates network latency, distributed transaction complexity, and deployment friction.

## Decision
We will build ResearchOS as a **Modular Monolith**:
- Single FastAPI backend codebase organized into bounded modules (`auth`, `workspaces`, `research`, `knowledge`, `experiments`, `collaboration`, `ai`, `publication`).
- Single PostgreSQL database instance providing transactional ACID guarantees and relational foreign keys.
- Clear internal boundaries with Router ➔ Service ➔ Repository layering.

## Consequences
- Fast local development with simple Docker Compose orchestration.
- Zero distributed transaction overhead for complex multi-entity DAG updates.
- Easy refactoring and evolution as new research domains are added.
