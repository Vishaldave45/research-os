# Backend Architecture Specification

## Technology Stack
- **FastAPI**: Modern, high-performance async web framework with automatic OpenAPI documentation.
- **SQLAlchemy 2.0 (Async)**: Type-safe async ORM with explicit session management.
- **Alembic**: Database migrations tracking all schema iterations.
- **Pydantic v2**: Strict request/response validation and serialization.
- **Asyncpg**: High-throughput async PostgreSQL driver.

## Clean Layer Separation
```
API Routers (`app/api/v1/`)
     ↓
Services Layer (`app/services/`)
     ↓
Repository Layer (`app/repositories/`)
     ↓
SQLAlchemy ORM (`app/models/`)
     ↓
PostgreSQL Database
```

## Evidence Chain Traversal Engine
The evidence chain algorithm performs recursive graph queries on the indexed `relationships` table to assemble full backward dependency chains:
$$\text{Decision} \rightarrow \text{Result} \rightarrow \text{Experiment} \rightarrow \text{Hypothesis} \rightarrow \text{Gap} \rightarrow \text{Paper} \rightarrow \text{Question}$$
All traversals are depth-bounded, indexed, and strictly scoped to the active `workspace_id`.
