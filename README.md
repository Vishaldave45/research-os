# ResearchOS — Scientific Reasoning & Evidence Provenance Graph

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red?style=for-the-badge&logo=sqlalchemy)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![XYFlow React](https://img.shields.io/badge/@xyflow/react-12.11-ff0072?style=for-the-badge)

<p align="center">
  <strong>An operating system for high-stakes scientific reasoning, literature synthesis, and empirical provenance.</strong><br>
  Transforms unstructured papers, hypotheses, benchmark trials, and decisions into a topological, auditable knowledge graph.
</p>

</div>

---

## 🧭 Overview & Core Principles

Scientific and deep-tech engineering workflows frequently suffer from **provenance fragmentation**:
- Literature citations live disconnected in reference managers.
- Hypotheses and research logs sit in scattered markdown files or notebooks.
- Hardware and benchmark metrics are trapped in isolated spreadsheets and experiment trackers.
- Architectural and clinical decisions lose their empirical backing over time.

**ResearchOS** resolves this by modeling scientific research as a **strongly-typed, directed acyclic reasoning graph (DAG)**. Every scientific claim and engineering decision is deterministically traceable backward to its empirical results, experimental protocols, hypotheses, literature gaps, and original inquiries.

### Key Guarantees:
1. **Single Source of Truth**: All data persists in PostgreSQL via FastAPI REST endpoints and synchronizes to the frontend Zustand store. No in-memory fixture substitution or fake DB fallbacks.
2. **Multi-Tenant Workspace & Project Isolation**: Research workspaces and projects are isolated at the database query level with strict JWT authentication and role-based permissions (`Owner`, `Admin`, `Researcher`, `Viewer`).
3. **Deterministic Provenance**: Backward trace algorithms recursively traverse the directed reasoning DAG from any Decision or Claim back to the motivating literature.
4. **Scientific Integrity**: Empirical metrics and execution states reflect actual benchmark outcomes. Unexecuted experiments remain strictly in the `planned` state.

---

## 🏛️ Research Ontology (8 Archetypes + Semantic Relations)

```text
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
| 📊 | **Empirical Result** | `R-###` | Quantitative metrics (FPS, Power Watts, AUC, Temperature, Latency) |
| 🔀 | **Decision / Verdict** | `D-###` | Architecture decisions, firmware acceptance/rejection, trade-off rationale |
| 🛡️ | **Scientific Claim** | `C-###` | Grounded assertions with computed evidentiary confidence scores (0–100%) |

### 2. Directed Relationship Ontology
- `informs`: Theoretical or domain knowledge provides context for an inquiry or gap.
- `motivates`: Literature gap or clinical requirement prompts a new hypothesis.
- `addresses`: Novel method or hypothesis directly solves a question or gap.
- `tests`: Benchmark experiment executes validation protocol on a hypothesis.
- `supports`: Empirical result validates or confirms a hypothesis, decision, or claim.
- `refutes`: Empirical result falsifies or exposes failure modes of a hypothesis or claim.
- `cites`: Publication cites or builds upon antecedent literature.
- `derived_from`: High-level claim or production decision originates from upstream findings.

---

## ⚡ Key Modules & Interactive Interfaces

### 1. 🏢 Multi-Workspace & Research Project Switcher
- Instant dropdown switching between research labs (`WorkspaceSwitcher`) and projects (`ProjectSwitcher`).
- Dedicated **Workspace Members Modal** allowing lab owners to invite colleagues and assign roles.

### 2. 🌌 Spatial Graph Canvas (`@xyflow/react`)
- **Interactive Custom Nodes**: Archetype-specific colorways, metric chips, status indicators, and connection handles.
- **Automated Pipeline Layout**: Repositions nodes left-to-right following the canonical research lifecycle:
  `Questions ➔ Literature ➔ Gaps ➔ Hypotheses ➔ Experiments ➔ Results ➔ Decisions ➔ Claims`.
- **Semantic Edge Styling**: Color-coded edges (`#10b981` supports, `#ef4444` refutes, `#6366f1` motivates/tests) with animated directional flow.
- **DAG Cycle Detection**: Real-time BFS cycle prevention protecting knowledge graph integrity.

### 3. 📋 Literature Matrix View
- Side-by-side comparative analysis of peer-reviewed papers.
- Quantitative synthesis across methods, hardware testbeds, power envelopes, compression benchmarks, key findings, and documented limitations.

### 4. 🔍 Backward Traceability Engine
- Deterministic backward provenance traversal from any Decision (e.g. `D-001`) through Results, Experiments, Hypotheses, and Literature.
- Visual chain inspection, grounding status, and lineage path generation.

### 5. 🛡️ Evidentiary Claim Auditor
- **Confidence Scoring**: Dynamically computed from empirical trials and replication strength.
- **Direct Backing Tracing**: Highlights which empirical metrics validate the assertion.
- **Constraint Violation Alerts**: Warns if thermal thresholds (e.g. capsule shell >41.5°C) or latency limits are breached.

### 6. 📖 End-to-End Evidence Narrative
- Chronological, step-by-step audit trail from the initial clinical question to final hardware firmware decisions.

### 7. 🗃️ Entity Registry & CSV Export
- Searchable, filterable tabular registry with instant sorting, type classification, and one-click CSV export.

### 8. ⌨️ Global Command Palette (`Cmd+K` / `Ctrl+K`)
- Instant fuzzy navigation to any entity code (e.g. `H-001`, `P-003`, `D-001`, `C-001`) or workspace view mode.

---

## 🛠️ Architecture & Project Structure

```text
researchos/
├── backend/                       # Canonical FastAPI + PostgreSQL Backend
│   ├── app/
│   │   ├── api/v1/                # REST API Routers (auth, workspaces, projects, questions, papers, gaps, hypotheses, experiments, results, decisions, claims, relationships, graph, synthesis, seed)
│   │   ├── models/                # SQLAlchemy 2.0 Async Models (14 tables with CASCADE/RESTRICT constraints)
│   │   ├── schemas/               # Pydantic v2 Request/Response Schemas with robust ORM validators
│   │   ├── services/              # Domain Services (auth, project, graph traversal, lineage, audit, seed)
│   │   ├── repositories/          # Async database repository layer
│   │   ├── core/                  # Database engine (NullPool), auth security, config validation
│   │   └── main.py                # FastAPI app initialization, middleware & exception handlers
│   ├── alembic/                   # Database migrations (PostgreSQL DDL)
│   ├── tests/                     # 31 Pytest suites running against live PostgreSQL
│   ├── Dockerfile                 # Backend container definition
│   └── requirements.txt           # Python dependencies
│
├── src/                           # Frontend Client (React 19 + TypeScript + Tailwind v4 + Zustand)
│   ├── types/                     # Canonical domain interfaces & schema types
│   ├── store/                     # Zustand store with authoritative API synchronization
│   ├── utils/                     # Semantic ontology rules & DAG cycle detection
│   ├── services/api/              # Typed REST API client bindings
│   ├── features/                  # Feature-based modules (auth, workspaces, projects)
│   ├── components/
│   │   ├── canvas/                # @xyflow/react canvas, custom nodes, edges, pipeline layout
│   │   ├── inspector/             # Precision node inspector drawer
│   │   ├── synthesis/             # Literature matrix, gap discovery, claims auditor, evidence chain
│   │   ├── table/                 # Tabular entity registry & CSV export
│   │   ├── layout/                # App header with Workspace/Project Switchers
│   │   └── modals/                # Create entity, link modal, command palette, trace modal, members modal
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # React DOM bootstrap
│
├── docker-compose.yml             # Full-stack composition (PostgreSQL 15 + FastAPI + Vite)
├── Dockerfile                     # Multi-stage production container build
├── package.json                   # Web application manifest & scripts
├── tsconfig.json                  # Strict TypeScript configuration
└── .env.example                   # Environment configuration template
```

---

## 🚀 Getting Started

### Option A: Local Development

```bash
# 1. Start PostgreSQL (e.g. via Docker)
docker run --name researchos-db -e POSTGRES_USER=researchos -e POSTGRES_PASSWORD=researchos_secret_password -e POSTGRES_DB=researchos_db -p 5432:5432 -d postgres:16-alpine

# 2. Setup & Start Backend (FastAPI)
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Apply database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Setup & Start Frontend (React + Vite)
# In root directory:
npm install
npm run dev

# 4. Open http://localhost:3000 in your browser
```

### Option B: Full-Stack Docker Compose

```bash
# Start all services (PostgreSQL, FastAPI Backend, React Frontend)
docker compose up --build

# Access endpoints:
# - Frontend UI: http://localhost:3000
# - FastAPI Swagger Docs: http://localhost:8000/docs
# - FastAPI Health: http://localhost:8000/health
# - PostgreSQL: localhost:5432
```

---

## 🧪 Verification & Test Suite

```bash
# 1. Run all 31 backend tests against PostgreSQL
cd backend
.venv/bin/pytest -v

# 2. Run frontend type checking & lint
npm run lint

# 3. Build frontend production bundle
npm run build

# 4. Validate Docker Compose configuration
docker compose config
```

---

## 📄 License

Distributed under the Apache-2.0 License.
