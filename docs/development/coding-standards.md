# Coding Standards & Development Principles

## Core Principles
1. **SOLID, DRY & Separation of Concerns**: Strict boundary between presentation, state, domain logic, and data access.
2. **Type Safety**: No `any` types; all API requests, responses, models, and UI props must have explicit TypeScript / Pydantic types.
3. **Security by Default**: Every database query is scoped to `workspace_id`. Authentication tokens are verified on all non-public routes.
4. **Resilient Error Handling**: Centralized exception handlers; informative user-facing error states without leaking backend stack traces.
5. **No Mock Persistence**: Real database persistence in PostgreSQL via SQLAlchemy.
