# Analytics Definitions

This document defines how the system computes its core analytics: cycle time, aging work‑in‑progress (WIP), throughput, and forecasting. These definitions are workflow‑agnostic and rely solely on the state‑machine semantics described in the workflow documentation. The goal is to ensure that all metrics are calculated consistently, transparently, and in a way that reflects real operational behavior.

---

## Cycle Time

Cycle time measures how long it takes for a work item to move from the beginning of active work to a terminal state. It is the primary indicator of delivery speed.

### Definition

Cycle time is calculated as:

- The timestamp when an item **first enters any in‑progress state**  
  **to**  
- The timestamp when the item **enters a terminal state**

The calculation uses **inclusive date math** and **normalized UTC timestamps** to ensure consistency across environments.

### Rules

- Only the **first** entry into an in‑progress state is used.
- Only the **first** entry into a terminal state is used.
- Waiting or blocked states count toward cycle time.
- Items with no in‑progress entry or no terminal entry are excluded from cycle‑time analytics.
- Skipped states do not affect the calculation as long as transitions remain monotonic.

### Interpretation

Cycle time reflects the total elapsed time required to complete work, including active effort, waiting, and delays. It is not a measure of effort but of flow efficiency.

---

## Aging Work‑In‑Progress (Aging WIP)

Aging WIP measures how long items have been active without reaching a terminal state. It highlights stalled or at‑risk work.

### Definition

Aging WIP is calculated as:

- The timestamp when an item **first enters any in‑progress state**  
  **to**  
- The **current date** (or analysis date) if the item has not yet reached a terminal state

### Rules

- Only applies to items currently in in‑progress or waiting states.
- Uses inclusive date math and normalized UTC timestamps.
- Items in backlog or terminal states are not included.
- Re‑entry into in‑progress states does not reset aging.

### Interpretation

Aging WIP identifies items that have been active for longer than expected. High aging values often indicate bottlenecks, unclear ownership, or blocked work.

---

## Throughput

Throughput measures how many items reach a terminal state within a given time window. It is the primary indicator of delivery volume.

### Definition

Throughput is the count of items whose **terminal‑state entry timestamp** falls within the selected time range.

### Rules

- Only the first terminal entry is used.
- Items must have valid terminal timestamps.
- Time windows may be daily, weekly, monthly, or custom.
- Throughput is independent of workflow structure.

### Interpretation

Throughput reflects the system’s output rate. It is often used alongside cycle time to understand capacity and predictability.

---

## Monte Carlo Forecasting

Forecasting uses historical throughput to simulate future outcomes. It provides probabilistic estimates rather than deterministic predictions. Two simulation types are supported: **How Many** and **How Long**.

### Inputs

- A set of historical daily throughput counts, optionally filtered to a user-defined date window
- If the selected window contains fewer than 5 data points, the system falls back to the full dataset automatically
- A simulation count (default: 2,000 runs)

### How Many — "How many items can we finish by a target date?"

**Additional input:** a forecast horizon defined by a start and end date.

**Process:**

1. Compute the number of calendar days in the forecast horizon.
2. For each simulation run, randomly sample that many daily throughput values (with replacement) and sum them.
3. Repeat for the configured number of simulations.
4. Sort results and compute percentiles.

**Outputs:**

- **p05** — 95% chance of completing at least this many items
- **p15** — 85% chance of completing at least this many items
- **p50** — 50% chance of completing at least this many items

### How Long — "How long will it take to finish a target number of items?"

**Additional input:** a target item count.

**Process:**

1. For each simulation run, repeatedly sample daily throughput values (with replacement), accumulating totals until the target count is reached.
2. Record the number of days required.
3. Repeat for the configured number of simulations.
4. Sort results and compute percentiles.

**Outputs:**

- **p50** — 50% chance of finishing within this many days
- **p85** — 85% chance of finishing within this many days
- **p95** — 95% chance of finishing within this many days

An optional start date may be provided to convert day counts into projected completion dates.

### Interpretation

Both simulations sample from observed throughput behavior rather than assuming a fixed delivery rate. This means forecasts naturally reflect variability in the team's actual output. Results are sensitive to the representativeness of the selected data window — a window covering an unusually fast or slow period will produce skewed forecasts.

---

## Data Requirements

Accurate analytics depend on clean, consistent data:

- All timestamps must be valid and monotonic.
- Terminal states must be correctly identified.
- Items must have complete transition histories.
- Dates must be normalized to UTC.
- Missing or invalid data is excluded from calculations.

---

## Summary

These analytics definitions establish a consistent, workflow‑agnostic foundation for measuring flow performance. By enforcing clear rules and relying on normalized data, the system provides reliable insights into delivery speed, work‑in‑progress health, output volume, and future projections.
