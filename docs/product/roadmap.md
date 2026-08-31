# ResearchOS Milestone Roadmap

This roadmap defines our progressive milestones anchored to the GitHub release baseline.

```text
GitHub Release: v0.1.0 (Foundation Baseline @ 92c42f7)
      │
      ├── v0.1.x Foundation Hardening (Architecture, ADRs, Real API Fetch, Postgres Isolation) [COMPLETED]
      │
      ├── v0.2.0 Research Core (Multi-domain, 10-Entity DAG, Visual Linking & Evidence Graph) [CURRENT DEV]
      │
      ├── v0.3.0 Experiment Traceability & Deep Lineage (Datasets, Models, Runs, Backward Prove)
      │
      ├── v0.4.0 CollaborationOS (Comments, Peer Reviews, Activity Feeds & Audit Trails)
      │
      ├── v0.5.0 Integrations (GitHub, MLflow, Zotero, OpenAlex)
      │
      ├── v0.6.0 AI Research Copilot & Grounded RAG (Provider Abstraction: Gemini/OpenAI/Claude)
      │
      ├── v0.7.0 PublicationOS (LaTeX IEEEtran, BibTeX compilation, Evidence Traceability Matrix)
      │
      └── v1.0.0 Stable Multi-Domain Research Operating System
```

## Milestone Definitions

### v0.1.0 — Foundation Baseline (Released)
- Baseline repository setup, JWT authentication, initial WCE schema and layout.

### v0.2.0 — Research Core (In Progress on `dev`)
- First-class `ResearchDomain` and `Evidence` entities.
- Full 10-archetype `@xyflow/react` spatial canvas with semantic directed edge constraints.
- Real-time creation/update/deletion against PostgreSQL.

### v0.3.0 — Experiment Traceability (Next Milestone)
- Dataset Registry & Model Registry deep integration with benchmark runs.
- Multi-step recursive backward provenance query engine.
