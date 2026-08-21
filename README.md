# ResearchOS — Spatial Research Reasoning & Evidence Provenance Graph

<div align="center">

![ResearchOS Version](https://img.shields.io/badge/version-1.0.0-indigo?style=for-the-badge&logo=git)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![XYFlow React](https://img.shields.io/badge/@xyflow/react-12.11-ff0072?style=for-the-badge)
![Status](https://img.shields.io/badge/Release-Production--Ready-emerald?style=for-the-badge)

<p align="center">
  <strong>An operating system for high-stakes scientific reasoning, literature synthesis, and empirical provenance.</strong><br>
  Transforms unstructured papers, hypotheses, benchmark trials, and decisions into a topological, auditable knowledge graph.
</p>

</div>

---

## 🧭 Overview & Motivation

Scientific and deep-tech engineering workflows often suffer from **cognitive fragmentation**:
- Literature notes live disconnected in reference managers.
- Hypotheses and research logs sit in scattered markdown files or notebooks.
- Hardware and benchmark metrics are trapped in CSVs and experiment trackers.
- Architectural and clinical decisions lose their empirical backing over time.

**ResearchOS (v1.0.0)** bridges this divide by modeling scientific research as a **strongly-typed, directed acyclic reasoning graph (DAG)**. Every scientific claim is directly traceable backward to its empirical results, experimental protocols, hypotheses, literature gaps, and original inquiries.

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
| Icon | Archetype | Prefix | Purpose & Attributes |
| :--- | :--- | :--- | :--- |
| ❓ | **Research Question** | `Q-###` | Core clinical or engineering inquiry, domain scope, priority |
| 📚 | **Literature Paper** | `P-###` | Peer-reviewed publications, authors, venue, year, findings, limitations |
| ⚠️ | **Literature Gap** | `G-###` | Identified frontier blindspots, impact level, unaddressed constraints |
| 💡 | **Hypothesis** | `H-###` | Testable, falsifiable scientific conjectures with formal rationale & confidence |
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
- **Smart Pipeline Alignment**: Instantly repositions all nodes left-to-right following the canonical research lifecycle:
  `Questions ➔ Literature ➔ Gaps ➔ Hypotheses ➔ Experiments ➔ Results ➔ Decisions ➔ Claims`.
- **Semantic Edge Routing**: Color-coded edges (`#10b981` supports, `#ef4444` refutes, `#6366f1` motivates/tests) with animated directional particle flow.
- **Lineage Tracing**: Selecting any node illuminates its entire upstream lineage (what led to this) and downstream progeny (what this influences).

### 2. 📋 Literature Matrix View
- Side-by-side comparative analysis of peer-reviewed papers.
- Quantitative synthesis across methods, hardware testbeds, power envelopes, compression benchmarks, key findings, and documented limitations.

### 3. 🧠 AI Gap Discovery & Hypothesis Generator
- Automated discovery of unexplored research frontiers (e.g., *Dynamic Patch Token Pruning during high-speed peristalsis*).
- **1-Click Adoption**: Converts AI-suggested hypotheses with pre-populated validation protocols directly into active canvas nodes.

### 4. 🛡️ Evidentiary Claim Auditor
- Evaluates the rigor of high-stakes scientific claims:
  - **Evidentiary Confidence Calculation**: Grounded in empirical trial count and replication strength.
  - **Direct Backing Tracing**: Highlights which empirical metrics validate the assertion.
  - **Contradiction / Anomaly Detection**: Warns if thermal thresholds (e.g., capsule shell >41.5°C) or latency limits are violated.

### 5. 📖 End-to-End Evidence Narrative
- Chronological, step-by-step audit trail from the initial clinical question to final hardware firmware decisions.

### 6. 🗃️ Entity Registry & CSV Export
- Searchable, filterable tabular registry with instant sorting, type classification, and one-click CSV export for external reporting.

### 7. ⌨️ Global Command Palette (`Cmd+K` / `Ctrl+K`)
- Instant fuzzy navigation to any entity code (e.g. `H-001`, `P-003`, `C-001`) or workspace view mode.

### 8. 🤖 ResearchOS Reasoning Copilot
- Graph-aware conversational assistant capable of answering deep architectural questions, auditing claims, and retrieving evidence citations.

---

## 🔬 Canonical Pre-Seeded Dataset: Edge AI for WCE

ResearchOS ships pre-configured with a complete, production-grade deep-tech research project:

> **Project Title:** *Ultra-Low-Power Edge Vision Transformer for Wireless Capsule Endoscopy (WCE)*  
> **Clinical Domain:** Real-time small-bowel lesion detection (angiodysplasia & occult bleeding).  
> **Hardware Target:** Embedded SoC (NVIDIA Jetson Nano / Coral Edge TPU / ARM Cortex-M85) operating under a strict **2.4W / 41.5°C thermal threshold**.

---

## 🛠️ Tech Stack & Engineering Architecture

```
researchos/
├── src/
│   ├── types/
│   │   └── research.ts            # Canonical data types, entity schemas & edge definitions
│   ├── store/
│   │   └── useResearchStore.ts    # Centralized Zustand state management & canonical seed
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── ResearchCanvas.tsx # @xyflow/react canvas, pipeline layout & controls
│   │   │   ├── ResearchNode.tsx   # Custom ReactFlow node with metric badges & handles
│   │   │   └── CustomEdge.tsx     # Semantic edge with relation labels & animations
│   │   ├── inspector/
│   │   │   └── NodeInspector.tsx  # Deep-dive drawer with lineage trees & metrics
│   │   ├── synthesis/
│   │   │   ├── LiteratureMatrixView.tsx
│   │   │   ├── GapDiscoveryView.tsx
│   │   │   ├── ClaimValidationView.tsx
│   │   │   └── EvidenceChainView.tsx
│   │   ├── table/
│   │   │   └── EntityTableView.tsx# Tabular index with CSV export
│   │   ├── layout/
│   │   │   └── Header.tsx         # Top navigation bar, stats, view selector
│   │   └── modals/
│   │       ├── CreateNodeModal.tsx
│   │       ├── CreateRelationshipModal.tsx
│   │       ├── CommandPalette.tsx
│   │       └── AIAssistantModal.tsx
│   ├── App.tsx                    # Root application entry
│   ├── main.tsx                   # React 19 DOM bootstrap
│   └── index.css                  # Tailwind CSS v4 styling rules
├── package.json                   # v1.0.0 configuration
├── vite.config.ts                 # Vite bundler setup
└── tsconfig.json                  # Strict TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Local Development

1. **Clone or Export the Repository**
   ```bash
   git clone https://github.com/your-username/researchos.git
   cd researchos
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000`.

4. **Run Type-Check & Linter**
   ```bash
   npm run lint
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📦 Pushing to GitHub

To push ResearchOS to your GitHub account:

### Option A: Via AI Studio Settings (Recommended)
1. In Google AI Studio, click the **Settings / Menu** icon in the top navigation bar.
2. Select **Export to GitHub**.
3. Choose your repository name and push the codebase directly with all commits and structure intact.

### Option B: Via Standard Git CLI
```bash
git init
git add .
git commit -m "feat(release): ResearchOS v1.0.0 - Spatial Research Reasoning Graph"
git branch -M main
git remote add origin https://github.com/<your-username>/researchos.git
git push -u origin main
```

---

## 📄 License
Distributed under the Apache-2.0 License. See `LICENSE` for more information.
