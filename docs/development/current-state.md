# Current Repository & Architecture State (Milestone Baseline Audit)

## Baseline Summary
- **Release Version**: `v0.1.0` (commit `5f53811` on `main`/`dev`)
- **Backend Architecture**: FastAPI + SQLAlchemy 2.0 Async + PostgreSQL 16 + Alembic (`c3f5a1b4d7e8`)
- **Frontend Architecture**: React 19 + Vite 6 + Tailwind v4 + TypeScript 5.8 + Zustand + @xyflow/react
- **Test Suite**: 31 Backend Pytest Suites Passing (100% against live PostgreSQL)

## Implemented Entity Archetypes (10 Tables)
1. `ResearchQuestion` (`questions`)
2. `Paper` (`papers`)
3. `Evidence` (`evidence_items`)
4. `Dataset` (`datasets`)
5. `ModelRegistry` (`model_registry`)
6. `Gap` (`gaps`)
7. `Hypothesis` (`hypotheses`)
8. `Experiment` (`experiments`)
9. `Result` (`results`)
10. `Decision` (`decisions`)
11. `Claim` (`claims`)
12. `Relationship` (`relationships`)
13. `Comment` (`comments`)
14. `ResearchReview` (`research_reviews`)
15. `AuditLog` (`audit_logs`)

## Identified Architectural Debt for Foundation Hardening (Phase 0.1)
1. **Frontend `client.ts` Mock Fallbacks**: `src/services/api/client.ts` still contains ~700 lines of legacy in-memory localStorage/mock-routing methods that intercept calls when `handleInternalRoute` is used rather than performing clean `fetch()` calls to `http://localhost:8000/api/v1`.
2. **Legacy Firebase Artifacts**: Unused Firebase scaffolding files (`firebase-applet-config.json`, `firebase-blueprint.json`, `firestore.rules`) should be cleaned up.
3. **Frontend Vite API Proxy**: `vite.config.ts` needs a proxy configured for `/api` to route cleanly to `http://localhost:8000`.
