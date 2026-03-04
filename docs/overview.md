# System Overview

The application is a workflow analytics platform designed to help teams understand how work moves through their process, where it slows down, and how long it takes to complete. It combines a flexible workflow model, a principled analytics engine, and a user‑centered interface to provide actionable insights grounded in real operational behavior. The system emphasizes explicit state semantics, honest cycle‑time calculations, and a modular architecture that supports maintainability and deep analysis.

---

## Purpose

The platform enables teams to visualize and measure the flow of work across customizable workflows. It focuses on answering three core questions:

- How long does work take to complete?
- Where does work spend its time?
- How much work is currently in progress, and how old is it?

These questions are addressed through workflow state tracking, derived metrics, and Monte Carlo forecasting.

---

## Core Concepts

Several foundational ideas shape both the user experience and the analytics engine:

- **Work items** represent units of work that move through a defined workflow.
- **Workflows** are sequences of states with explicit semantics and allowed transitions.
- **State transitions** record when an item enters or exits a state.
- **Terminal states** represent completion or abandonment and define the end of cycle time.
- **Cycle time** measures the duration from the first “in progress” state to a terminal state.
- **Aging WIP** measures how long items have been active without reaching a terminal state.
- **Throughput** counts how many items reach a terminal state within a given time window.

These concepts form the backbone of the system’s analytics.

---

## High‑Level Architecture

The system is organized into three major layers.

### User Interface

React components present workflows, charts, and item details. This includes the Overview page, dedicated analytics subpages, and interactive elements such as tooltips and filters.

### State Management

A centralized store manages workflows, items, analytics results, and user settings. Actions and selectors are modularized for clarity and maintainability.

### Analytics Pipeline

A set of pure functions computes cycle time, aging WIP, throughput, and forecasting results. These functions operate on normalized data and enforce consistent semantics across the application.

Each layer is designed to be testable, predictable, and independent.

---

## Data Flow

Data moves through the system in a predictable sequence:

1. **Input** — Items and workflows are loaded or created by the user.  
2. **Normalization** — Dates, states, and transitions are standardized to ensure consistency.  
3. **Storage** — The normalized data is stored in the application state.  
4. **Computation** — Analytics functions derive metrics from the stored data.  
5. **Presentation** — Results are rendered in charts, tables, and summaries.

This flow ensures that analytics always reflect the current state of the data.

---

## Invariants

The system enforces several rules to maintain correctness:

- Terminal states cannot be exited once entered.
- Cycle time calculations use inclusive date math and normalized UTC timestamps.
- Items may skip states, but transitions must remain monotonic.
- Analytics are workflow‑agnostic and rely only on state semantics, not state names.
- Forecasting uses deterministic simulation settings and reproducible randomization.

These invariants keep the analytics honest and the behavior predictable.

---

## User Experience Principles

The interface is designed around clarity and empowerment:

- Visual balance and alignment guide the user’s attention.
- Tooltips and contextual cues explain metrics and edge cases.
- Empty states and warnings help users understand what the system needs.
- Charts are placed on dedicated subpages to reduce cognitive load.
- Language is precise, consistent, and aligned with industry expectations.

The goal is to make complex analytics approachable without oversimplifying them.