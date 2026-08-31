# Current Repository & Architecture State (Milestone v1.0.0 Readiness)

## Release Summary
- **Baseline Release**: `v0.1.0 — Foundation` (`92c42f7`)
- **Current Target Release**: `v1.0.0 — Multi-Domain Scientific Reasoning & Evidence Provenance OS`
- **Active Branch**: `dev` / `main`
- **Backend Architecture**: FastAPI + SQLAlchemy 2.0 Async + PostgreSQL 16 + Alembic (`c3f5a1b4d7e8`)
- **Frontend Architecture**: React 19 + Vite 6 + Tailwind v4 + TypeScript 5.8 + Zustand + @xyflow/react
- **Test Suite**: 34 Backend Pytest Suites Passing (100% against live PostgreSQL)

## Milestones Completed & Hardened
- ✅ **v0.1.x Foundation Hardening**: Architecture docs, ADRs, Vite API proxy, real HTTP `fetch()` client.
- ✅ **v0.2.0 Research Core**: 10-Entity DAG (`Questions`, `Literature`, `Evidence`, `Datasets`, `Models`, `Gaps`, `Hypotheses`, `Experiments`, `Results`, `Decisions`, `Claims`), visual linking, and semantic ontology rule checking.
- ✅ **v0.3.0 Experiment Traceability & Deep Lineage**: Recursive backward provenance graph traversals from Claims to Literature roots.
- ✅ **v0.4.0 CollaborationOS**: Contextual threaded comments, peer review verification verdicts, and immutable audit logs in Node Inspector.
- ✅ **v0.5.0 Integrations**: External adapters for BibTeX/Zotero, MLflow telemetry sync, and GitHub commit provenance.
- ✅ **v0.6.0 AI Research Copilot & Grounded RAG**: Provider abstraction layer (Gemini, Local) with PostgreSQL graph context builder and entity citations.
- ✅ **v0.7.0 PublicationOS**: Manuscript composer, IEEEtran LaTeX export, BibTeX bibliography compiler, and automated Evidence Traceability Matrix.
- ✅ **v1.0.0 Release Verification**: Full multi-tenant isolation, clean build, and 100% test pass rate.
