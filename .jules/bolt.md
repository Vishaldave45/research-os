# Bolt's Performance Journal

## 2025-05-15 - Unmemoized Selector Functions in Table View Rendering
**Learning:** Returning array concatenations inside Zustand helper functions (such as `getAllEntities()`) triggers full array re-allocation on every render frame when called directly in components without `useMemo`. When combined with array filtering, string formatting, and sorting in table components, this results in unnecessary recalculations on every keystroke or unrelated state change.
**Action:** Subscribe directly to individual primitive state slices in Zustand (`useResearchStore((s) => s.questions)`, etc.) and wrap multi-step array processing (aggregation, filtering, sorting) with `useMemo` so calculations only run when dependencies change.
