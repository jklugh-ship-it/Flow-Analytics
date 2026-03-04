# Data Model

This document describes the shape of the data objects used throughout the analytics pipeline — from CSV ingestion through normalization to the final metrics written to the store. It is intended as a reference for contributors working on new metric functions or store actions.

---

## Raw Item (from `parseWorkflowCsv`)

Produced by the CSV parser before any cycle-time fields are derived. This is what gets passed to `setItems`.

```js
{
  id: string,                  // from the "id" column
  title: string,               // from the "title" column
  created: Date | null,        // earliest non-null entered date across all workflow states
  completed: Date | null,      // entered date of the final workflow state, or null
  entered: {
    entered_StateName: Date | null,  // one key per workflow state column
    // e.g. entered_Ready, entered_Done
  },
  _rowIndex: number            // 1-based source row number for error reporting
}
```

Notes:
- `entered` keys always use the `entered_` prefix regardless of how the CSV column was named — normalization happens at parse time.
- `created` and `completed` are convenience fields derived from `entered`. They are not used by the analytics pipeline directly.
- All dates are UTC midnight `Date` objects. Invalid or out-of-range dates (outside 1990–2050) are stored as `null`.

---

## Normalized Item (after `recomputeCycleFields`)

The raw item is transformed by `recomputeCycleFields` before metrics are computed. This is the shape that all metric functions receive.

```js
{
  // --- All raw item fields are preserved ---
  id: string,
  title: string,
  created: Date | null,
  completed: Date | null,        // note: overwritten — see below
  entered: { ... },              // original nested entered map, preserved

  // --- Entered dates flattened onto the item ---
  entered_StateName: Date | null,  // one key per workflow state, e.g.
  // entered_Ready: Date,
  // entered_In Progress: Date,
  // entered_Done: Date,

  // --- Derived cycle fields ---
  cycleStart: Date | null,   // UTC midnight date of first in-progress state entry
  cycleEnd: Date | null,     // UTC midnight date of final workflow state entry
  completed: boolean         // true if cycleEnd is non-null (overwrites raw item's completed)
}
```

Notes:
- The `entered_*` dates are flattened directly onto the item object (not nested under `entered`) so that metric functions can access them as `item["entered_Ready"]` without traversing the nested map.
- `cycleStart` is derived from the first workflow state that has `inProgressStates[state] === true`. If no in-progress state has been entered, `cycleStart` is `null`.
- `cycleEnd` is derived from the final state in `workflowStates`. It does not depend on in-progress configuration.
- `completed` is a boolean derived from `cycleEnd` — it overwrites the `Date | null` value from the raw item.
- All dates are normalized to UTC midnight, stripping any time component.

---

## Metrics Object (from `computeAllMetrics`)

Returned by `computeAllMetrics` and written to `store.metrics`. Each field corresponds to one chart or panel in the UI.

```js
{
  cfd: [
    { date: string, StateName: number, ... }
    // One entry per day. Each workflow state is a key with a cumulative item count.
    // e.g. { date: "2024-01-15", Ready: 12, "In Progress": 4, Done: 8 }
  ],

  wipRun: [
    { date: string, count: number }
    // Daily WIP count from earliest cycleStart to today.
  ],

  throughputRun: [
    { date: string, count: number }
    // Daily completed item count from earliest entry date to today.
  ],

  cycleHistogram: [
    { value: number, count: number }
    // One bucket per distinct cycle time (in days). Sorted ascending by value.
  ],

  cycleTimeScatter: [
    { date: string, value: number }
    // One point per completed item. date = cycleEnd, value = cycle time in days.
  ],

  agingWip: [
    { id: string, state: string, ageDays: number }
    // One entry per active (non-completed) item that has a cycleStart.
    // ageDays is inclusive: an item started today has ageDays = 1.
  ],

  cycleTimePercentiles: {
    p50: number | null,
    p70: number | null,
    p85: number | null,
    p95: number | null
    // Null when there are no completed items.
  },

  wipItems: NormalizedItem[],
    // Subset of normalized items that are currently in progress:
    // no cycleEnd and at least one in-progress state entered.

  wipStateCounts: {
    StateName: number, ...
    // Count of WIP items currently in each state.
    // All workflow states are present; states with no WIP items have count 0.
    // Ordered to match workflowStates array.
  },

  stability: {
    today:     { arrivalRate: number, throughput: number, wipAge: number },
    lastWeek:  { arrivalRate: number, throughput: number, wipAge: number },
    lastMonth: { arrivalRate: number, throughput: number, wipAge: number }
    // arrivalRate: items entering first in-progress state in the window
    // throughput: items entering terminal state in the window
    // wipAge: average age in days of WIP items as of the window end date (inclusive)
  }
}
```

---

## Throughput History (from `computeAllMetrics`)

Returned alongside `metrics` and stored separately at `store.throughputHistory`. Used as the input to Monte Carlo simulations.

```js
throughputHistory: number[]
// Flat array of daily completed item counts, one value per day,
// extracted from throughputRun. e.g. [0, 2, 0, 1, 3, 0, 1]
```

---

## Summary Object (from `computeSummary`)

Written to `store.summary`. Feeds the high-level stat display on the Overview page.

```js
{
  totalItems: number,       // total items in the dataset
  completedItems: number,   // items where completed === true
  avgCycleTime: number,     // weighted average cycle time in days, rounded
  avgThroughput: number     // average daily throughput across all days, rounded
}
```

---

## Forecast Results

Written to the store by the Monte Carlo simulation hooks. Not derived from the analytics pipeline — computed on demand when the user runs a simulation.

```js
// store.howManyResults / store.howManyPercentiles
howManyResults: number[]    // raw simulation outputs, sorted ascending
howManyPercentiles: {
  p05: number,  // 95% confidence lower bound
  p15: number,  // 85% confidence lower bound
  p50: number   // 50% confidence (median)
}

// store.whenHowLongResults / store.whenHowLongPercentiles
whenHowLongResults: number[]  // raw simulation outputs (days), sorted ascending
whenHowLongPercentiles: {
  p50: number,  // 50% confidence
  p85: number,  // 85% confidence
  p95: number   // 95% confidence
}
```

---

## Store Shape Summary

For a complete picture of what is and is not persisted to `localStorage`, see [`architecture.md`](architecture.md). In brief: workflow configuration (`workflowStates`, `workflowVisibility`, `inProgressStates`) is persisted; all items, metrics, and forecast results are session-only.
