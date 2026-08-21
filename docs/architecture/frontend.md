# Frontend Architecture Specification

## Framework & Core Libraries
- **React 19 + TypeScript**: Type-safe, component-driven UI.
- **Vite**: Ultra-fast build and dev tooling.
- **React Flow (`@xyflow/react`)**: Canvas engine for the spatial Research Map.
- **React Router v6/v7**: Client-side routing with clean URL parameters.
- **Zustand**: Lightweight global state management for auth, active workspace, canvas viewport, and inspector selection.
- **Zod & React Hook Form**: Type-safe form validation and state handling.
- **Lucide React**: Crisp semantic vector iconography.

## Key UI Structural Concepts
1. **Canvas-as-Home**: The primary view is the interactive Research Map displaying nodes (Questions, Papers, Gaps, Hypotheses, Experiments, Results, Decisions) and directed reasoning edges.
2. **Contextual Node Inspector**: A slide-out precision panel displaying selected node details, metadata, links, upstream/downstream evidence trace, and quick actions.
3. **Global Command Palette (`Cmd+K`)**: Rapid search and entity navigation.
4. **Precision Entity Views**: Dedicated tables and structured records for detailed management.
