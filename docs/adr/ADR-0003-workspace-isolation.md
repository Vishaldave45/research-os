# ADR-0003: Multi-Tenant Workspace & Domain Isolation

## Status
Accepted

## Context
Researchers and laboratories handle confidential data, unpublished intellectual property, and proprietary model architectures. Data from one workspace must never leak into another.

## Decision
1. **Workspace Boundary**: Every core entity must have a non-nullable `workspace_id` foreign key referencing `workspaces.id`.
2. **Context Resolution**: The backend resolves workspace context via authenticated user JWT token and `X-Workspace-Id` header.
3. **Database Scoping**: All repository queries must enforce `.where(Entity.workspace_id == workspace_id)`.
4. **Role-Based Access**: Workspace memberships define roles (`Owner`, `Admin`, `Researcher`, `Viewer`) with strict permission checks before write operations.
