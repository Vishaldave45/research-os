# ResearchOS — Scientific Reasoning & Evidence Provenance Graph

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![XYFlow React](https://img.shields.io/badge/@xyflow/react-12.11-ff0072?style=for-the-badge)

<p align="center">
  <strong>An operating system for high-stakes scientific reasoning, literature synthesis, and empirical provenance.</strong><br>
  Transforms unstructured papers, hypotheses, benchmark trials, and decisions into a topological, auditable knowledge graph.
</p>

</div>

---

## 🧭 Overview & Motivation

Scientific and deep-tech engineering workflows frequently suffer from **provenance fragmentation**:
- Literature citations live disconnected in reference managers.
- Hypotheses and research logs sit in scattered markdown files or notebooks.
- Hardware and benchmark metrics are trapped in isolated spreadsheets and experiment trackers.
- Architectural and clinical decisions lose their empirical backing over time.

**ResearchOS** resolves this by modeling scientific research as a **strongly-typed, directed acyclic reasoning graph (DAG)**. Every scientific claim and engineering decision is deterministically traceable backward to its empirical results, experimental protocols, hypotheses, literature gaps, and original inquiries.

---

## 🏛️ Research Ontology (8 Archetypes + 8 Semantic Edges)

ResearchOS formalizes research into eight first-class entities with strict directional semantics:

```
[ Question ] ──(informs)──► [ Paper ] ──(motivates)──► [ Literature Gap ]
                                                              │
                                                        (motivates)
                                                              ▼
[ Decision ] ◄──(supports)── [ Result ] ◄──(tests)── [ Hypothesis ]
     │                              ▲
(derived_from)                      │ (supports / refutes)
     ▼                              │
[ Scientific Claim ] ───────────────┘
```

### 1. Entity Archetypes
| Icon | Archetype | Prefix | Purpose & Key Attributes |
| :--- | :--- | :--- | :--- |
| ❓ | **Research Question** | `Q-###` | Clinical or engineering inquiry, domain scope, priority |
| 📚 | **Literature Paper** | `P-###` | Peer-reviewed publications, authors, venue, year, findings, limitations |
| ⚠️ | **Literature Gap** | `G-###` | Identified frontier blindspots, impact level, unaddressed constraints |
| 💡 | **Hypothesis** | `H-###` | Testable, falsifiable conjectures with formal rationale & confidence score |
| 🧪 | **Experiment** | `E-###` | Concrete protocol, hardware platform, batch configurations, parameters |
| 📊 | **Empirical Result** | `R-###` | Quantitative metrics (Throughput FPS, Power Watts, AUC, Temperature) |
| 🔀 | **Decision / Verdict** | `D-###` | Architecture decisions, firmware acceptance/rejection, trade-off rationale |
| 🛡️ | **Scientific Claim** | `C-###` | Grounded assertions with computed evidentiary confidence scores (0–100%) |

### 2. Directed Relationship Semantics
- `cites`: Publication cites or builds upon antecedent literature.
- `informs`: Theoretical or domain knowledge provides context for an inquiry.
- `motivates`: Literature gap or clinical requirement prompts a new hypothesis.
- `addresses`: Novel method or hypothesis directly solves a question or gap.
- `tests`: Benchmark experiment executes validation protocol on a hypothesis.
- `supports`: Empirical result validates or confirms a hypothesis/claim.
- `refutes`: Empirical result falsifies or exposes failure modes of a hypothesis.
- `derived_from`: High-level claim or production decision originates from upstream findings.

---

## ⚡ Key Modules & Interactive Interfaces

### 1. 🌌 Spatial Graph Canvas (`@xyflow/react`)
- **Custom Interactive Nodes**: Archetype-specific colorways, metric strips, status chips, and quick-action connection handles.
- **Smart Pipeline Alignment**: Repositions all nodes left-to-right following the canonical research lifecycle:
  `Questions ➔ Literature ➔ Gaps ➔ Hypotheses ➔ Experiments ➔ Results ➔ Decisions ➔ Claims`.
- **Semantic Edge Routing**: Color-coded edges (`#10b981` supports, `#ef4444` refutes, `#6366f1` motivates/tests) with animated directional particle flow.
- **Lineage Tracing & Cycle Prevention**: Real-time BFS cycle detection preventing cycles in the reasoning DAG.

### 2. 📋 Literature Matrix View
- Side-by-side comparative analysis of peer-reviewed papers.
- Quantitative synthesis across methods, hardware testbeds, power envelopes, compression benchmarks, key findings, and documented limitations.

### 3. 🔍 Backward Traceability Engine
- Deterministic backward provenance traversal from any Decision (e.g. `D-001`) through Results, Experiments, Hypotheses, and Literature.
- Provides visual chain inspection, grounding status, and verification scores.

### 4. 🛡️ Evidentiary Claim Auditor
- Evaluates the rigor of scientific claims:
  - **Evidentiary Confidence Calculation**: Grounded in empirical trial count and replication strength.
  - **Direct Backing Tracing**: Highlights which empirical metrics validate the assertion.
  - **Contradiction / Anomaly Detection**: Warns if thermal thresholds (e.g., capsule shell >41.5°C) or latency limits are violated.

### 5. 📖 End-to-End Evidence Narrative
- Chronological, step-by-step audit trail from the initial clinical question to final hardware firmware decisions.

### 6. 🗃️ Entity Registry & CSV Export
- Searchable, filterable tabular registry with instant sorting, type classification, and one-click CSV export for external reporting.

### 7. ⌨️ Global Command Palette (`Cmd+K` / `Ctrl+K`)
- Instant fuzzy navigation to any entity code (e.g. `H-001`, `P-003`, `D-001`, `C-001`) or workspace view mode.

---

## 🛠️ Architecture & Project Structure

```
researchos/
├── backend/                       # Canonical FastAPI + PostgreSQL Backend
│   ├── app/
│   │   ├── api/v1/                # REST API Routers (questions, papers, gaps, hypotheses, experiments, results, decisions, claims, relationships, graph, auth)
│   │   ├── models/                # SQLAlchemy Models (10 tables with foreign keys and cascade rules)
│   │   ├── schemas/               # Pydantic v2 Request/Response Schemas
│   │   ├── services/              # Domain Services (graph traversal, decision provenance, seed)
│   │   ├── core/                  # Database config, auth security, settings
│   │   └── main.py                # FastAPI app initialization & CORS middleware
│   ├── alembic/                   # Database migrations
│   ├── tests/                     # Pytest suite with real database fixtures
│   ├── Dockerfile                 # Backend container definition
│   └── requirements.txt           # Python dependencies
│
├── src/                           # Frontend Client (React 19 + TypeScript + Tailwind v4)
│   ├── types/                     # Canonical domain interfaces & schema types
│   ├── store/                     # Zustand store with authoritative API synchronization
│   ├── utils/                     # Semantic ontology rules & DAG cycle detection
│   ├── services/api/              # Typed REST API client bindings
│   ├── components/
│   │   ├── canvas/                # @xyflow/react canvas, custom nodes, edges, pipeline layout
│   │   ├── inspector/             # Precision node inspector drawer
│   │   ├── synthesis/             # Literature matrix, gap discovery, claims auditor, evidence chain
│   │   ├── table/                 # Tabular entity registry & CSV export
│   │   ├── layout/                # App header, navigation, breadcrumbs
│   │   └── modals/                # Create entity, link modal, command palette, trace modal
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # React DOM bootstrap
│
├── server/                        # Node preview runtime & API proxy gateway
│   ├── routes/                    # API routes proxying requests and serving preview state
│   ├── services/                  # TraceService & provenance algorithms
│   └── db/                        # Persistent JSON database engine for preview sandbox
│
├── docker-compose.yml             # Full-stack composition (FastAPI + PostgreSQL + Vite)
├── Dockerfile                     # Multi-stage production container build
├── package.json                   # Web application manifest & scripts
└── tsconfig.json                  # Strict TypeScript configuration
```

---

## 🚀 Getting Started

### Option A: Local Development Server (Instant Preview)

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open http://localhost:3000 in your browser
```

### Option B: Full-Stack Docker Compose (FastAPI + PostgreSQL)

```bash
# 1. Start all services (PostgreSQL 16, FastAPI backend, React frontend)
docker-compose up --build

# 2. Access the services:
#    - Frontend UI: http://localhost:3000
#    - FastAPI API Docs (Swagger): http://localhost:8000/docs
#    - PostgreSQL: localhost:5432
```

---

## 🧪 Verification & Testing

```bash
# Run frontend TypeScript type checking and linter
npm run lint

# Build production bundle
npm run build

# Run backend Python tests (inside backend environment)
pytest backend/tests/
```

---

## 📄 License

Distributed under the Apache-2.0 License.
