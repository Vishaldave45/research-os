# ADR-000: V1 Scope — ResearchOS Traceability Core

## Status
Accepted

## Context
Research teams frequently suffer from context fragmentation across disconnected tools (Zotero for papers, GitHub for code, MLflow for runs, Overleaf for papers, Google Drive for datasets/artifacts). Crucially, the *reasoning chain*—why an experiment was run, what hypothesis it tested, what evidence motivated it, and what scientific decision it yielded—is lost or scattered in informal chat logs and mental memory.

While future capabilities (AI Copilots, automated compute runners, semantic knowledge search, publication manuscript sync) are exciting and architecturally anticipated, implementing them prematurely will compromise core reliability and database integrity.

## Decision
V1 is strictly scoped to the **Traceability Core**:
1. Multi-tenant workspace isolation and role-based access control.
2. The complete 7-node reasoning chain:
   - **Research Question** → **Paper** → **Gap** → **Hypothesis** → **Experiment** → **Result** → **Decision**
3. Unified polymorphic bidirectional relationships table (`Relationship`).
4. Backward and forward Evidence Chain traversal API (`/api/v1/decisions/{id}/evidence-chain`).
5. Interactive spatial Research Map powered by React Flow with custom node semantics.
6. Contextual Node Inspector and entity detail precision tools.
7. Real persistence using PostgreSQL with strict Alembic schema migrations.

## Consequences
- **Scope Discipline**: No vector databases, Neo4j, LLM agents acting as sources of truth, or automatic background Colab dispatchers in V1.
- **Data Integrity**: PostgreSQL is the single source of truth. Relationships are fully indexed and foreign-key enforced.
- **Extensibility**: Provider interfaces (`AIProvider`, `ComputeProvider`, `StorageProvider`, `ExperimentTrackerProvider`) are defined as abstract contracts without premature heavy dependencies.
