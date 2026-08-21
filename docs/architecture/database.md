# Database Architecture & Alembic Migrations

## Overview
ResearchOS utilizes **PostgreSQL** as its single, immutable source of truth. All schema changes are versioned and applied strictly via **Alembic** migrations.

## Entity Relational Design

```
+-------------------+       +-----------------------+       +----------------------+
|       users       | <---- | workspace_memberships | ----> |      workspaces      |
+-------------------+       +-----------------------+       +----------------------+
          |                                                             |
          +-----------------------------+-------------------------------+
                                        | (workspace_id, created_by)
                                        v
+----------------------------------------------------------------------------------+
|                              RESEARCH ENTITIES                                   |
|                                                                                  |
|  [research_questions]  [papers]  [gaps]  [hypotheses]  [experiments]  [results]  |
|                                                                                  |
|                                  [decisions]                                     |
+----------------------------------------------------------------------------------+
                                        |
                                        v
+----------------------------------------------------------------------------------+
|                                relationships                                     |
|                                                                                  |
|  • id (UUID PK)                                                                  |
|  • workspace_id (FK -> workspaces.id)                                            |
|  • source_type ('question'|'paper'|'gap'|'hypothesis'|'experiment'|'result'|'dec')  |
|  • source_id (UUID)                                                              |
|  • target_type (VARCHAR(50))                                                     |
|  • target_id (UUID)                                                              |
|  • relation_type ('supports'|'tests'|'derived_from'|'informs'|'produces'|etc.)    |
|  • metadata (JSONB)                                                              |
+----------------------------------------------------------------------------------+
```

## Migration Execution
To apply migrations against the database:
```bash
cd backend
alembic upgrade head
```

To generate a new schema revision based on updated SQLAlchemy models:
```bash
alembic revision --autogenerate -m "describe_change"
```
