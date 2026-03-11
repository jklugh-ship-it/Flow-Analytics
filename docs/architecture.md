# Architecture

This document describes the structure of the Flow Analytics codebase — how it is organized, why key decisions were made, and where to look when adding or changing functionality.

---

## Directory Structure

```
src/
  components/         Reusable UI components (charts, inputs, layout)
    charts/           Chart components (one per metric type)
  hooks/              Custom React hooks (Monte Carlo simulation runners)
  layout/             App shell (AppLayout, HeaderBar)
  pages/              Route-level page components
    charts/           Dedicated chart subpages
  store/              Zustand store (useAnalyticsStore)
  utils/
    date/             Date parsing and formatting utilities
    metrics/          Pure metric computation functions
    recompute/        Orchestration layer (recomputeEverything)
    workflow/         Workflow mutation and validation utilities
  workers/            Web Worker for off-thread Monte Carlo simulation
```

---

## Layers

The application is organized into four distinct layers, each with a clear responsibility.

### 1. Pages and Components

Pages are thin route-level containers. They read from the store and pass data down to components. They contain no computation logic.

Chart components are responsible for rendering a single metric. They receive pre-computed data as props and do not access the store directly, with the exception of `CfdChart`, which accesses store state inside its tooltip to compute per-state counts on hover.

Shared UI components (`PrimaryButton`, `EmptyState`, etc.) are purely presentational and have no store dependencies.

### 2. Store

The store (`useAnalyticsStore`) is the single source of truth for all application state. It is built with Zustand and uses the `persist` middleware to save workflow configuration to `localStorage` across sessions.

**What is persisted:**
- `workflowStates` — the ordered list of workflow states
- `workflowVisibility` — per-state visibility toggles
- `inProgressStates` — per-state in-progress flags
- `hasUserCustomizedInProgress` — whether the user has manually overridden defaults

**What is not persisted:**
- Uploaded items and all derived metrics — these are recomputed from the uploaded CSV each session
- Simulation results — these are ephemeral and regenerated on demand

This separation is intentional. Workflow configuration is the user's persistent setup. Item data is session-scoped both for privacy and because persisting large datasets in `localStorage` is unreliable.

### 3. Analytics Pipeline

All metric computation happens in pure functions under `src/utils/metrics/`. These functions take normalized items and workflow configuration as inputs and return data structures ready for rendering. They have no side effects and no store dependencies.

The pipeline runs in a fixed sequence orchestrated by `recomputeEverything`:

```
setItems() or setWorkflowStates() or toggleInProgressState()
  → recomputeEverything(get, set)
    → recomputeCycleFields(items, inProgressStates, workflowStates)
        Derives cycleStart, cycleEnd, and flattened entered_* dates for each item
    → computeAllMetrics(itemsWithCycle, workflowStates, inProgressArray)
        Runs all metric functions in parallel and returns a metrics object
    → computeSummary(itemsWithCycle, metrics)
        Derives high-level summary values (totals, averages)
    → set({ items, metrics, throughputHistory, summary })
        Commits everything to the store in a single update
```

Any action that changes the inputs to metrics — uploading new data, modifying the workflow, toggling in-progress states — triggers a full recompute. This keeps the store consistent without requiring fine-grained cache invalidation.

### 4. Simulation Layer

Monte Carlo simulations run separately from the analytics pipeline. They are triggered explicitly by the user (via "Run Simulation") rather than automatically.

Two simulation types are implemented:

- **How Many** (`simulateHowMany`, `useMonteCarloHowMany`) — samples daily throughput over a date range
- **How Long** (`simulateDuration`, `useMonteCarloWhenHowLong`) — samples daily throughput until a target count is reached

Both hooks follow the same pattern: accept a throughput window, fall back to the full dataset if the window is too small, run the simulation, and write results directly to the store via setter functions.

A legacy `monteCarloWorker.js` Web Worker also exists and is used by `MonteCarloSummary`. It runs the same style of simulation off the main thread. The primary forecasting path (`Forecasts.jsx`) uses the hook-based approach instead.

---

## Key Design Decisions

### Recompute on Every Relevant Change

Rather than tracking which metrics depend on which inputs, the system recomputes all metrics whenever any relevant input changes. This is simple, predictable, and eliminates an entire class of stale-data bugs. The cost is some redundant computation on large datasets, but this has not been a practical problem for the expected data sizes.

### Pure Metric Functions

All metric computation is isolated in pure functions with no store access. This makes them straightforward to test in isolation, easy to reason about, and safe to call from any context. The store's job is to own state and trigger computation; the utils' job is to do the math.

### Workflow-Agnostic Analytics

Metric functions never reference state names directly. They operate on the semantics of states — whether a state is in-progress, whether an item has a `cycleStart`, whether a date falls within a window — rather than on names like "In Progress" or "Done". This means the analytics work correctly for any workflow configuration without modification.

### Selective Persistence

Only workflow configuration is persisted to `localStorage`. This is a deliberate privacy decision: item data (which may contain sensitive work descriptions or identifiers) is never written to disk. It also means the app starts in a clean state each session, which prevents stale or mismatched data from causing confusing analytics.

### Store Partialize Over Full Persistence

The Zustand `persist` middleware uses `partialize` to select exactly which fields are saved. This prevents internal flags like `_skipRecompute`, ephemeral simulation results, and large item arrays from being accidentally persisted as the store evolves.

---

## Data Flow

```
User uploads CSV
  → CsvUploader parses file via parseWorkflowCsv()
  → Detected workflow states written to store via setWorkflowStates()
  → Normalized items written to store via setItems()
  → recomputeEverything() triggered
  → Metrics written to store
  → React components re-render with new data
```

```
User modifies workflow (add/delete/reorder state, toggle in-progress)
  → Store action updates workflowStates or inProgressStates
  → recomputeEverything() triggered
  → All metrics recomputed against existing items with new workflow config
  → Components re-render
```

```
User runs Monte Carlo simulation
  → Hook reads throughputHistory from store
  → Applies date window filter (or uses full dataset)
  → Runs simulateHowMany() or simulateDuration()
  → Results written directly to store (howManyResults, whenHowLongResults)
  → Forecast components re-render with new results
```

---

## Where to Add Things

**New metric** — add a pure function in `src/utils/metrics/`, call it from `computeAllMetrics`, add the result to the metrics object in the store's initial state, and create a chart component in `src/components/charts/`.

**New chart page** — add a page component in `src/pages/charts/`, add a route in `App.js`, and add navigation in the layout.

**New workflow action** — add a pure mutation function in `src/utils/workflow/workflowMutations.js`, add a store action in `useAnalyticsStore` that calls it and triggers `recomputeEverything`.

**New simulation type** — add a simulation function in `src/utils/`, add a hook in `src/hooks/`, add settings and results fields to the store, and wire up a UI panel on the Forecasts page.

---

## Known Architectural Notes


- The `_skipRecompute` flag in the store exists to prevent `recomputeEverything` from running during `resetStore`, when the store is in a temporarily inconsistent state. It is guarded with `try/finally` to ensure it is always cleared.
