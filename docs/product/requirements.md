# ResearchOS Requirements Specification (v1 Traceability Core)

## Functional Requirements
- **FR-1**: User registration, login, and JWT session handling with refresh token rotation.
- **FR-2**: Workspace creation, multi-tenancy, and member role assignment (`owner`, `researcher`, `reviewer`).
- **FR-3**: CRUD management for all 7 research entities: Questions, Papers, Gaps, Hypotheses, Experiments, Results, Decisions.
- **FR-4**: Flexible relationship creation between any two research entities (`supports`, `tests`, `derived_from`, `informs`, `cited_by`, `produces`, `motivates`, `contradicts`, `depends_on`).
- **FR-5**: Backward Evidence Chain traversal for decisions.
- **FR-6**: Interactive Spatial Research Map with custom node cards, status badges, and zoom/pan controls.
- **FR-7**: Contextual Node Inspector showing live properties, linked evidence, and direct link actions.
- **FR-8**: Global Search / Command Palette (`Cmd+K`) across all workspace entities.

## Non-Functional Requirements
- **NFR-1 (Security)**: Strict workspace data isolation enforced at the service/repository layer.
- **NFR-2 (Persistence)**: Full durability in PostgreSQL; zero loss on browser or server restart.
- **NFR-3 (Accessibility & UX)**: WCAG AA contrast, keyboard accessibility (`Cmd+K`, `Escape`, `Enter`), responsive states (loading, empty, error).
