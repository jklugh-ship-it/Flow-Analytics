# Testing

This document describes the testing approach for Flow Analytics — what is tested, how tests are structured, what the conventions are, and where gaps exist.

---

## Stack

- **Vitest** — test runner and assertion library
- **jsdom** — browser environment simulation for store tests
- **@testing-library/jest-dom** — extended DOM matchers (configured in `tests/setup.js`)
- **@vitest/coverage-v8** — code coverage via V8

Tests live in the `tests/` directory. The Vite config includes them via `tests/**/*.test.js`.

To run tests:

```bash
npm test
```

To run with coverage:

```bash
npm run coverage
```

---

## What Is Tested

### Pure Utility Functions

The majority of the test suite covers pure functions in `src/utils/`. These are the most important functions to test because they contain all the analytics logic and have no side effects or dependencies to mock.

**Date utilities (`src/utils/date/`)**

- `parseDate` — covers null/undefined/empty inputs, ISO `YYYY-MM-DD`, ISO timestamps, `MM/DD/YYYY`, single-digit month/day formats, invalid strings, rollover dates (e.g. `2024-02-30`), whitespace trimming, and UTC stability.
- `daysBetween` — covers null inputs, positive differences, zero differences, negative differences, and raw `Date` objects.

**Metric functions (`src/utils/metrics/`)**

- `eachDay` — covers empty ranges, single-day ranges, inclusive multi-day ranges, and timezone drift.
- `formatDate` — covers date formatting, time component dropping, UTC correctness, and non-Date input rejection.
- `computeCfd` — covers empty input, per-state counts on a given day, invalid entered dates, continuous timeline generation, all key normalization fallbacks, states absent from some items, and no-valid-dates edge cases.
- `computeCycleTimeHistogram` — covers empty input, bucketing by cycle time, grouping multiple items into the same bucket, and missing or invalid dates.
- `computeCycleTimePercentiles` — covers empty input, invalid date filtering, correct percentile values for simple sorted lists, linear interpolation, sort-order independence, and identical cycle times.
- `computeCycleTimeScatter` — covers empty input, correct `{ date, value }` mapping, missing/invalid date filtering, and input order preservation.
- `computeThroughputRun` — covers completion counts per day, correct start date (earliest entry), and correct end date (today UTC).
- `computeWipRun` — covers WIP counts per day, correct date range, and items still in progress (no `cycleEnd`).

**Simulation functions (`src/utils/`)**

- `simulateHowMany` — covers empty/null input, correct simulation count, sorted output, percentile ordering (p05 ≤ p15 ≤ p50), deterministic results for fixed throughput, zero-throughput datasets, and exact day count per run.
- `simulateDuration` — covers empty/null input, correct simulation count, sorted output, percentile ordering (p50 ≤ p85 ≤ p95), deterministic results for fixed throughput, and minimum one day per simulation.

**CSV parsing (`src/utils/`)**

- `parseWorkflowCsv` — covers structural validation (missing id/title columns, no workflow columns, empty rows), column normalization (both `entered_StateName` and plain `StateName` formats), date parsing (valid ISO dates, empty cells, out-of-range years, invalid strings), item normalization (created date, completed date, null completed, empty row filtering, id/title preservation), and multi-row parsing.

**Recompute pipeline (`src/utils/`)**

- `recomputeCycleFields` — covers cycleStart derivation from first in-progress state, cycleEnd derivation from final state, null cycleStart when no in-progress state entered, null cycleEnd when final state missing, completed flag, entered date flattening, UTC midnight normalization, multiple items, and empty input.

**Stability metrics (`src/utils/metrics/`)**

- `computeAgingWip` — covers empty input, exclusion of completed items, exclusion of items without cycleStart, and correct state and age for active items.
- `computeHistoricalWipAge` — covers empty input, items not yet started on the window date, items completed before or on the window date, items completed after the window date, items still in progress, earliest-date selection across multiple in-progress states, items with no in-progress entries, average age calculation, rounding, items entered exactly on the window date, mixed WIP/non-WIP sets, and single in-progress state.
- `computeArrivalRate` — covers items within the window, items outside the window, missing state entries, and boundary date inclusion.
- `computeThroughput` — covers items within the window, items outside the window, boundary dates, and dynamic state name support.
- `computeStability` — covers return shape (today/lastWeek/lastMonth keys and their sub-fields), zero counts for empty input, today throughput, and lastMonth throughput.

- `computeDefaultInProgress` — covers middle-state marking, single-state workflows, and two-state workflows.
- `normalizeVisibility` — covers adding missing states with default `true`, removing deleted states, and empty workflow edge case.
- `workflowMutations` — covers `addWorkflowState`, `deleteWorkflowState`, and `mergeWorkflowStates`.

### Store (`src/store/useAnalyticsStore`)

Store tests use `vi.mock` to stub out `recomputeEverything` and `computeAllMetrics`, isolating store behavior from the analytics pipeline.

Covered behaviors:
- `resetStore` — clears items, metrics, and summary while preserving workflow configuration
- `setWorkflowStates` — initializes visibility and in-progress defaults correctly
- `toggleWorkflowVisibility` — toggles correctly in both directions
- `toggleInProgressState` — toggles correctly in both directions
- `setItems` — stores items and triggers recomputation

---

## Conventions

### Test File Naming

Test files are named `<subject>.test.js` and live in the `tests/` directory. They mirror the source structure but are flat — there are no subdirectories under `tests/`.

### Describe / It Structure

Tests use `describe` blocks to group related cases, with `it` strings written as plain English sentences describing the expected behavior. Each `it` block tests one behavior.

### Dynamic Expectations

Where possible, tests compute expected values using the same underlying utility functions rather than hardcoding magic numbers. For example, `computeThroughputRun` tests derive expected completion counts by calling `parseDate` and `formatDate` directly, so they remain correct if date formatting ever changes.

This pattern is used intentionally for timeline-dependent tests (throughput run, WIP run) where the expected output includes today's date and would otherwise require constant updating.

### Mocking

Mocks are used sparingly and only at the store boundary, where the analytics pipeline would otherwise require a full environment to run. Pure utility functions are never mocked — they are tested directly.

Store tests call `resetStore()` in `beforeEach` to ensure a clean slate between tests.

### No Component Tests

There are currently no React component tests. The testing strategy focuses on the analytics logic, which is where correctness matters most and where bugs have the highest impact.

---

## Known Gaps

**`computeAllMetrics`** is not tested as an orchestrator. Individual metric functions are tested in isolation, but the integration that combines them is not.

**React components** have no tests. The testing strategy focuses on the analytics logic, which is where correctness matters most and where bugs have the highest impact. Component tests could be added with React Testing Library if UI regression coverage becomes a priority.

---

## Adding New Tests

New test files should be added to `tests/` and named `<subject>.test.js`. The Vite config picks them up automatically via the `tests/**/*.test.js` glob.

For pure functions, no setup is needed — import the function and call it directly. For store tests, mock `recomputeEverything` to keep tests fast and isolated, and call `resetStore()` in `beforeEach`.

When adding a new metric function to the analytics pipeline, a corresponding test file is the expected deliverable alongside the implementation.
