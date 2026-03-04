# Workflow Semantics and State‑Machine Rules

This document defines how work items move through a workflow, what each state represents, and the rules that govern transitions. These semantics form the foundation for all analytics, including cycle time, aging WIP, throughput, and forecasting. The goal is to provide a clear, consistent, and workflow‑agnostic model that supports accurate measurement and predictable behavior.

---

## Workflow Model

A workflow is a sequence of states that represent the lifecycle of a work item. Each state has explicit semantics, and transitions between states follow defined rules. Workflows may vary in structure, but they all share the same underlying principles.

A workflow consists of:

- **States** — named stages that represent the status of a work item.
- **Transitions** — movements from one state to another, recorded with timestamps.
- **Terminal states** — states that represent completion or abandonment and end the lifecycle.

Workflows are customizable, but the semantics described here apply to all configurations.

---

## State Types

States fall into several conceptual categories. These categories are not exposed directly to users but are used internally to ensure consistent analytics.

### Backlog States

Backlog states represent work that has not yet begun. Items may remain in backlog indefinitely without affecting cycle time or aging WIP.

Characteristics:

- No work has started.
- Items may move freely between backlog states.
- Entering or exiting backlog does not affect analytics.

### In‑Progress States

In‑progress states represent active work. Entering the first in‑progress state marks the beginning of cycle time.

Characteristics:

- Work is actively being performed.
- Cycle time begins on entry into the first in‑progress state.
- Aging WIP applies while an item is in any in‑progress state.

### Waiting or Blocked States

Waiting states represent periods where work is paused or blocked. These states still count toward cycle time and aging WIP.

Characteristics:

- Work is not actively progressing.
- Items may remain in waiting states for extended periods.
- These states contribute to cycle time and aging WIP.

### Terminal States

Terminal states represent the end of the workflow. Once an item enters a terminal state, its lifecycle is complete.

Characteristics:

- Cycle time ends on entry.
- Items cannot exit a terminal state.
- Throughput counts items entering terminal states.

---

## Transition Rules

Transitions define how items move between states. The system enforces several rules to maintain consistency and ensure accurate analytics.

### Monotonic Transitions

State transitions must be monotonic in time. Each transition must have a timestamp greater than or equal to the previous one.

### Skipping States

Items may skip states entirely. Skipping does not invalidate analytics as long as transitions remain monotonic.

### Re‑Entry Rules

Items may re‑enter non‑terminal states, but re‑entry does not reset cycle time. The system records each entry and exit, and analytics use the earliest relevant timestamp.

### Terminal State Rules

Terminal states have strict invariants:

- Items cannot exit a terminal state.
- Entering a terminal state ends cycle time.
- Additional transitions after a terminal state are ignored.

---

## Analytics Alignment

The workflow semantics directly support the analytics engine. Each metric relies on consistent interpretation of states and transitions.

### Cycle Time

Cycle time is calculated from the timestamp when an item first enters an in‑progress state to the timestamp when it enters a terminal state. The calculation uses inclusive date math and normalized UTC timestamps.

### Aging WIP

Aging WIP measures how long an item has been active without reaching a terminal state. It applies to items in in‑progress or waiting states.

### Throughput

Throughput counts items that enter a terminal state within a given time window. The timestamp of entry determines inclusion.

### Forecasting

Forecasting uses historical cycle times to simulate future outcomes. Accurate forecasting depends on consistent state semantics and transition rules.

---

## Edge Cases

The system handles several edge cases to maintain correctness.

- **Missing timestamps** — Items with incomplete transition data are excluded from analytics.
- **Out‑of‑order transitions** — Transitions with invalid ordering are ignored.
- **Multiple terminal entries** — Only the first terminal entry is used.
- **Items with no in‑progress states** — These items do not contribute to cycle time or aging WIP.

---

## Summary

These workflow semantics define how items move through the system and how analytics interpret that movement. By enforcing consistent rules and clear state definitions, the platform ensures accurate, reliable, and workflow‑agnostic insights.
