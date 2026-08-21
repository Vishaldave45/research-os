# ResearchOS Architecture & System Design

## High-Level Topology

```
+-------------------------------------------------------------------------+
|                              RESEARCHOS                                 |
|                                                                         |
|  +---------------------------+         +-----------------------------+  |
|  |     Frontend (SPA)        |         |       Backend API           |  |
|  |                           |         |                             |  |
|  | - React 19 + TypeScript   |  HTTP/  | - Python 3.11+ / FastAPI    |  |
|  | - Vite + React Router     |  JSON   | - Pydantic DTOs & Validation|  |
|  | - React Flow (Graph)      | <=====> | - Service Business Layer    |  |
|  | - Zustand State Manager   |         | - Repository Pattern        |  |
|  | - Semantic Design Tokens  |         | - SQLAlchemy 2.x Async ORM  |  |
|  +---------------------------+         +-----------------------------+  |
|                                                       |                 |
|                                                       v                 |
|                                        +-----------------------------+  |
|                                        |     PostgreSQL Database     |  |
|                                        |                             |  |
|                                        | - Source of Truth           |  |
|                                        | - UUID PKs, JSONB, FKs      |  |
|                                        | - Alembic Schema Migrations |  |
|                                        +-----------------------------+  |
+-------------------------------------------------------------------------+
```

## Layered Backend Organization
1. **Routers (`/api/v1/`)**: Pure HTTP handling, request deserialization, dependency injection (auth, workspace context), status codes.
2. **Services (`/services/`)**: Business logic, cross-entity validation, evidence-chain traversal algorithms, graph formatting.
3. **Repositories (`/repositories/`)**: Isolated database queries using SQLAlchemy 2.x async session, transactional consistency.
4. **Models (`/models/`)**: Declarative ORM entities mapping directly to PostgreSQL tables.
5. **Schemas (`/schemas/`)**: Strict Pydantic models for incoming payload validation and outgoing response contracts.
6. **Adapters (`/adapters/`)**: Future integration hooks (Storage, AI, Compute, Trackers).
