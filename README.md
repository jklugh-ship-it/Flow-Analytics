# Flow Analytics

A browser-based tool for measuring how work moves through your team's process. Upload a CSV of your work items, define your workflow, and get cycle time, WIP, throughput, and Monte Carlo forecasting — all computed locally with no data ever leaving your browser.

---

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## Usage

1. **Define your workflow** in the Workflow Designer — add states in order and mark which ones represent active work.
2. **Download the CSV template** to get a file pre-formatted for your workflow.
3. **Fill in your work item data** and upload it.
4. **Explore the charts** — Cumulative Flow, WIP, Cycle Time, Throughput, and Monte Carlo forecasts.

See [`docs/user-guide.md`](docs/user-guide.md) for full instructions including CSV format details.

---

## Privacy & Security

All data is processed entirely in your browser. Nothing is uploaded or transmitted. Your workflow configuration is saved to `localStorage`; your work item data is not. You can verify this by watching the Network tab in your browser's developer tools while uploading a file — no outbound requests will appear.

See [`docs/security.md`](docs/security.md) for a full security model description, including independent verification instructions and the automated dependency audit process.

---

## Development

```bash
npm run dev        # Run dev server
npm run build      # Production build (also runs dependency audit)
npm run preview    # Preview production build locally
npm test           # Run tests
npm run test:ui    # Run tests with Vitest UI
```

Tests live in `tests/`. Coverage is reported via V8.

---

## Documentation

| Document | Description |
|---|---|
| [`docs/overview.md`](docs/overview.md) | Purpose, core concepts, and system invariants |
| [`docs/user-guide.md`](docs/user-guide.md) | How to use the app, CSV format, chart interpretation |
| [`docs/workflow-semantics.md`](docs/workflow-semantics.md) | State machine rules, transition semantics, edge cases |
| [`docs/analytics.md`](docs/analytics.md) | Metric definitions and Monte Carlo simulation details |
| [`docs/architecture.md`](docs/architecture.md) | Code structure, design decisions, and extension points |
| [`docs/testing.md`](docs/testing.md) | Test coverage, conventions, and known gaps |
| [`docs/data-model.md`](docs/data-model.md) | Normalized data shapes used throughout the pipeline |
| [`docs/security.md`](docs/security.md) | Security model, dependency audit process, and verification |

---

## Tech Stack

- **React** — UI
- **Zustand** — state management
- **Recharts** — charts
- **@dnd-kit** — drag-and-drop in the Workflow Designer
- **Vite + Vitest** — build and test tooling
