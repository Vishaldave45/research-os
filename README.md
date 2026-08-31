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
2. **Multi-Tenant Workspace & Domain Isolation**: Research workspaces, domains, and projects are isolated at the database query level with strict JWT authentication and role-based permissions (`Owner`, `Admin`, `Researcher`, `Viewer`).
3. **Deterministic Provenance**: Backward trace algorithms recursively traverse the directed reasoning DAG from any Decision or Claim back to the motivating literature and evidence items.
4. **Scientific Integrity**: Empirical metrics and execution states reflect actual benchmark outcomes. Unexecuted experiments remain strictly in the `planned` state.

---

## 🏛️ Research Ontology (10 Archetypes + Semantic Relations)

```text
[ Question ] ──(informs)──► [ Paper ] ──(produces)──► [ Evidence Item ]
     │                                                        │
 (informs)                                               (motivates)
     ▼                                                        ▼
[ Dataset / Model ] ──(used_by)──► [ Hypothesis ] ◄──(addresses)── [ Literature Gap ]
                                          │
                                       (tests)
                                          ▼
[ Decision ] ◄──(supports)────── [ Experiment ] ──(produces)──► [ Result ]
     │                                                             │
(derived_from)                                                 (supports)
     ▼                                                             ▼
[ Scientific Claim ] ◄─────────────────────────────────────────────┘
```

### 1. Entity Archetypes
| Icon | Archetype | Prefix | Purpose & Key Attributes |
| :--- | :--- | :--- | :--- |
| ❓ | **Research Question** | `Q-###` | Clinical or engineering inquiry, domain scope, priority |
| 📚 | **Literature Paper** | `P-###` | Peer-reviewed publications, authors, venue, year, findings, limitations |
| 🔍 | **Evidence Item** | `EV-###` | First-class empirical or theoretical evidence, strength, citation DOIs, confidence |
| 💾 | **Dataset** | `slug` | Modality (image, tabular, text), preprocessing specs, train/val/test split configurations |
| 🤖 | **Model Architecture** | `slug` | Deep learning backbone specs, framework, checkpoint URLs, parameters, commit hash |
| ⚠️ | **Literature Gap** | `G-###` | Identified frontier blindspots, impact level, unaddressed constraints |
| 💡 | **Hypothesis** | `H-###` | Testable, falsifiable conjectures with formal rationale & confidence score |
| 🧪 | **Experiment** | `E-###` | Concrete protocol, hardware platform, batch configurations, parameters |
| 📊 | **Empirical Result** | `R-###` | Quantitative metrics (FPS, Power Watts, AUC, Temperature, Latency) |
| 🔀 | **Decision / Verdict** | `D-###` | Architecture decisions, firmware acceptance/rejection, trade-off rationale |
| 🛡️ | **Scientific Claim** | `C-###` | Grounded assertions with computed evidentiary confidence scores (0–100%) |

### 2. Directed Relationship Ontology
- `informs`: Theoretical or domain knowledge provides context for an inquiry, gap, or dataset.
- `motivates`: Literature gap, evidence item, or clinical requirement prompts a new hypothesis.
- `addresses`: Novel method or hypothesis directly solves a question or gap.
- `tests`: Benchmark experiment executes validation protocol on a hypothesis.
- `supports`: Empirical result validates or confirms a hypothesis, decision, or claim.
- `refutes`: Empirical result falsifies or exposes failure modes of a hypothesis or claim.
- `cites`: Publication cites or builds upon antecedent literature.
- `derived_from`: High-level claim or production decision originates from upstream findings.
- `produces`: Experiment execution yields empirical results or raw evidence items.

---

## ⚡ Comprehensive Feature Suites (Phases 1–6)

### 1. 🏢 Multi-Tenant Workspace & Domain Hierarchy (Phase 1 & 2)
- **Hierarchy:** `Workspace ➔ Research Domain ➔ Projects ➔ Research Graph`.
- **Domain Categorization:** Tag and isolate projects by discipline (e.g. *Medical AI*, *NLP / RAG*, *Robotics*).
- **Role-Based Access Control:** Invite researchers with fine-grained roles (`Owner`, `Admin`, `Researcher`, `Viewer`).

### 2. 🌌 Spatial Graph Canvas (`@xyflow/react`)
- **Interactive Custom Nodes:** Archetype-specific colorways, metric chips, status indicators, and connection handles.
- **Automated Pipeline Layout:** Repositions nodes left-to-right following the canonical research lifecycle:
  `Questions ➔ Literature/Evidence ➔ Gaps ➔ Hypotheses ➔ Models/Datasets ➔ Experiments ➔ Results ➔ Decisions ➔ Claims`.
- **DAG Cycle Detection:** Real-time BFS cycle prevention protecting knowledge graph integrity.

### 3. 💾 Dataset & Model Registries (Phase 3)
- **Dataset Registry:** Tracks curated research datasets, sample counts, size in bytes, licenses, and preprocessing/split specifications.
- **Model Registry:** Logs model architectures, frameworks (`pytorch`, `tensorflow`, `jax`, `onnx`), parameter counts, checkpoint URLs, and code commit provenance.

### 4. 🔍 Global Search & Research Timeline (Phase 3)
- **Cross-Entity Search (`/api/v1/search`):** Unified query matching titles, descriptions, and codes across all 10 entity archetypes with type-breakdown statistics.
- **Chronological Timeline (`/api/v1/timeline`):** Full research memory replay detailing every event (`inquired`, `reviewed`, `recorded`, `hypothesized`, `executed`, `quantified`, `decided`, `claimed`) along with upstream and downstream graph connections.

### 5. 💬 CollaborationOS (Phase 4)
- **Contextual Discussions (`/api/v1/collaboration/comments`):** Threaded peer comments on any research entity with `@mentions` and resolution states.
- **Peer Review Protocol (`/api/v1/collaboration/reviews`):** Formal artifact reviews with verdicts (`approved`, `changes_requested`, `rejected`), confidence ratings, and critique commentary.
- **Immutable Audit Trails (`/api/v1/collaboration/audit-logs`):** Granular audit log capturing before/after JSON states of all entity mutations.

### 6. 📄 PublicationOS — Automated Manuscript Export (Phase 5)
- **Scientific Paper Synthesis (`/api/v1/manuscripts/export`):** Compiles the research graph into peer-reviewed sections (Introduction, Related Work, Methodology, Results, Grounded Claims).
- **LaTeX Source Export (`.tex`):** Standard IEEEtran-formatted LaTeX documents ready for compilation.
- **BibTeX Library (`.bib`):** Automatically compiled citation keys and DOI metadata for all literature referenced in the graph.
- **Evidence Traceability Matrix:** Structured audit table linking verified claims directly to backing empirical results and experiments.

### 7. 🧠 Synthesis AI Engine (Phase 6)
- **Automated Gap Discovery (`/api/v1/synthesis/discover-gaps`):** Intelligent multi-paper contrastive analysis proposing frontier research gaps.
- **Hypothesis Generation (`/api/v1/synthesis/generate-hypotheses`):** Derives falsifiable hypotheses with rationale and experimental protocol blueprints.
- **Grounded Claim Validation (`/api/v1/synthesis/audit-claim`):** Audits assertions against empirical results and evidence items to detect contradictions and compute grounding confidence.
- **One-Click Graph Insertion (`/api/v1/synthesis/accept-proposal`):** Instantly inserts AI proposals into the live PostgreSQL DAG reasoning graph.

---

## 🛠️ Architecture & Codebase Structure

```text
researchos/
├── backend/                       # Canonical FastAPI + PostgreSQL Backend
│   ├── app/
│   │   ├── api/v1/                # REST API Routers (auth, workspaces, domains, projects, questions, papers, evidence, datasets, models, gaps, hypotheses, experiments, results, decisions, claims, relationships, graph, search, timeline, collaboration, manuscript, synthesis, seed)
│   │   ├── models/                # SQLAlchemy 2.0 Async Models (19 tables with CASCADE/RESTRICT constraints)
│   │   ├── schemas/               # Pydantic v2 Request/Response Schemas with robust ORM validators
│   │   ├── services/              # Domain Services (auth, domain, evidence, dataset, model, search, timeline, collaboration, manuscript, synthesis AI, graph, seed)
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
│   │   ├── synthesis/             # Literature matrix, gap discovery, claims auditor, evidence chain, manuscript composer
│   │   ├── table/                 # Tabular entity registry & CSV export
│   │   ├── layout/                # App header with Workspace/Project Switchers
│   │   └── modals/                # Create entity, link modal, command palette, trace modal, members modal
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # React DOM bootstrap
│
├── docker-compose.yml             # Full-stack composition (PostgreSQL 16 + FastAPI + Vite)
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

# 4. Open http://localhost:5173 in your browser
```

### Option B: Full-Stack Docker Compose

```bash
# Start all services (PostgreSQL, FastAPI Backend, React Frontend)
docker compose up --build

# Access endpoints:
# - Frontend UI: http://localhost:5173
# - FastAPI Swagger Docs: http://localhost:8000/docs
# - FastAPI Health: http://localhost:8000/health
# - PostgreSQL: localhost:5432
```

---

## 🧪 Verification & Test Suite

```bash
# 1. Run all backend tests against live PostgreSQL
cd backend
source .venv/bin/activate
pytest -v

# 2. Run frontend type checking & build
npm run build
```

---

## 📄 License

Distributed under the Apache-2.0 License.
