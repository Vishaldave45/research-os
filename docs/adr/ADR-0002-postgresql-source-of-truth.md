# ADR-0002: PostgreSQL as the Primary Source of Truth for Research Graph

## Status
Accepted

## Context
Scientific knowledge graphs require relational integrity, strong types, indexing, and transactional isolation. Dedicated graph databases (like Neo4j) introduce additional operational complexity, backup overhead, and data synchronization issues at this stage.

## Decision
Use **PostgreSQL** as the sole transactional source of truth:
- Primary entities (Questions, Papers, Evidence, Datasets, Models, Gaps, Hypotheses, Experiments, Results, Decisions, Claims) are stored in strongly-typed tables with UUID primary keys and workspace isolation.
- Graph edges and directional semantics (`tests`, `supports`, `refutes`, `addresses`, `informs`, `produces`) are stored in a indexed `relationships` table.
- Graph traversals, backward provenance lineage, and cycle detection are performed via efficient SQL/BFS algorithms in Python domain services.

## Consequences
- Single database backup and migration lifecycle via Alembic.
- Strict multi-tenant isolation through `workspace_id` foreign keys and indices.
