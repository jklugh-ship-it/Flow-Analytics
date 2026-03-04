# User Guide

Flow Analytics is a browser-based tool for measuring how work moves through your team's process. It is designed for Scrum Masters, Agile coaches, and anyone who wants to understand their team's delivery patterns using flow metrics. No server, no account, no data ever leaves your browser.

This guide covers everything you need to get started and serves as a reference for each part of the application.

---

## Getting Started

### Step 1 — Define Your Workflow

Before uploading any data, tell the application how your team's process is structured.

Navigate to **Workflow Designer** and add each state your work items move through, in order. Common examples include:

- Backlog → In Progress → Review → Done
- To Do → Analysis → Development → Testing → Released

For each state, configure two settings:

- **Visible** — whether this state appears in charts. You may want to hide terminal states like "Done" from the Cumulative Flow Diagram to reduce clutter.
- **In Progress** — whether this state counts as active work. States marked as In Progress define when cycle time starts and which items appear in aging WIP. Mark states where work is actively being performed, including waiting or blocked states that occur between active stages.

You can drag states to reorder them, merge states that represent the same stage under different names, or delete states that are no longer relevant.

> **Tip:** If your workflow has only two states, neither will be marked as In Progress by default, since the first and last states are treated as waiting and done. You will need to mark at least one state manually to see cycle time data.

---

### Step 2 — Download the CSV Template

Once your workflow is defined, click **Download CSV Template** in the Workflow Designer. This generates a CSV file with the correct column headers for your workflow, ready to fill in.

The template will look like this for a four-state workflow:

```
id,title,entered_Backlog,entered_In Progress,entered_Review,entered_Done
```

Each column records the date when a work item first entered that state. The `entered_` prefix is added automatically by the template download, but the parser also accepts plain state names — so `Backlog`, `entered_Backlog`, and `In Progress` are all valid column headers for the same state.

---

### Step 3 — Prepare Your Data

Fill in the template with your team's historical work items. Each row represents one work item.

**Required columns:**
- `id` — a unique identifier for the item (ticket number, issue key, etc.)
- `title` — a human-readable name or description

**Workflow columns:**
- One column per workflow state
- Column names can be plain state names (`Backlog`, `In Progress`) or prefixed with `entered_` (`entered_Backlog`, `entered_In Progress`) — both are accepted
- Enter the date the item first entered that state
- Leave the cell empty if the item never entered that state or has not yet reached it

**Accepted date formats:**
- `YYYY-MM-DD` (preferred) — e.g. `2025-03-15`
- `MM/DD/YYYY` — e.g. `03/15/2025`

**Example:**

```
id,title,entered_Backlog,entered_In Progress,entered_Review,entered_Done
1001,Add login page,2025-01-05,2025-01-08,2025-01-12,2025-01-14
1002,Fix nav bug,2025-01-06,2025-01-09,,
1003,Update README,2025-01-07,2025-01-10,2025-01-11,2025-01-13
```

In this example, item 1002 has not yet reached Review or Done — those cells are left empty, and the item will appear in aging WIP.

**A few things to keep in mind:**
- Dates must be monotonically increasing across columns — an item cannot enter Review before entering In Progress.
- Items with no in-progress entry dates will not contribute to cycle time or aging WIP.
- Items with no terminal state entry will be treated as still in progress.
- Dates outside the range 1990–2050 are rejected.

---

### Step 4 — Upload Your Data

Click **Upload CSV** in the header bar. Select your prepared file. The application will parse it, detect your workflow states automatically, and compute all metrics immediately.

If there are errors in your file — missing required columns, unreadable dates, or no usable rows — an error message will describe the problem.

Once uploaded, your workflow configuration is saved to your browser's local storage so it persists across sessions. Your data is not saved — you will need to re-upload it each session.

---

## Exploring Your Data

### Overview

The Overview page provides a snapshot of your team's current state:

- **Workflow graphic** — shows your defined states and which are marked as in progress.
- **Cycle Time** — percentile summary of how long completed items took. The 50th percentile means half of items completed in that many days or fewer; the 85th and 95th percentiles indicate the upper range of delivery time.
- **Current WIP** — how many items are currently in progress, broken down by state.
- **Stability** — a comparison of arrival rate, throughput, and average WIP age across today, the last 7 days, and the last 30 days. Stable systems show similar values across these windows.

---

### Cumulative Flow Diagram

The CFD shows how many items are in each state on each day. Healthy systems show smooth, parallel bands that grow steadily to the right. Signs of trouble include:

- Bands that flatten or narrow — work is not flowing through
- A bulging middle band — work is accumulating in a bottleneck state
- A shrinking input band without a corresponding output increase — the team is not pulling in new work

Use the Visible toggle in the Workflow Designer to hide or show states in this chart.

---

### Work in Progress

This page contains two views:

**Aging WIP chart** — plots each active item by its current state (x-axis) and how many days it has been in progress (y-axis). Reference lines at the 50th, 70th, 85th, and 95th cycle time percentiles help you identify items that have aged beyond your team's normal delivery range. Items above the 85th percentile line warrant attention.

**WIP over time** — shows how total WIP has changed day by day. Rising WIP without a corresponding rise in throughput is a sign that the system is taking on more work than it is completing.

---

### Cycle Time

This page contains two views:

**Cycle time histogram** — shows the distribution of cycle times across all completed items. A tight, left-leaning distribution indicates predictable delivery. A long tail to the right indicates occasional outliers that may be worth investigating.

**Cycle time scatterplot** — plots each completed item by completion date (x-axis) and cycle time (y-axis). Percentile reference lines help you see whether delivery time is trending up, down, or staying stable over time.

---

### Throughput

Shows daily throughput — how many items were completed on each day. Use this chart to understand your team's output rate and identify periods of high or low delivery. This data also feeds the forecasting simulations.

---

## Forecasting

The Forecasts page uses Monte Carlo simulation to answer two questions based on your team's historical throughput.

### Data Window

Before running a simulation, you can optionally restrict which historical data is used. Set a start and end date to focus the simulation on a recent, representative period — for example, the last 90 days — rather than the entire dataset. The throughput preview chart shows your full history with the selected window highlighted.

If you leave the window empty, the full dataset is used. If the selected window contains fewer than 5 data points, the system falls back to the full dataset automatically and will notify you.

Click **Reset to Full Dataset** to clear the window at any time.

---

### How Many Can We Finish?

Answers: *Given a time horizon, how many items are we likely to complete?*

Set a start date, end date, and simulation count, then click **Run Simulation**. The simulation randomly samples your historical daily throughput, repeats it for the number of days in the horizon, and runs the specified number of trials.

**Results:**
- **95% confidence** — there is a 95% chance of completing at least this many items
- **85% confidence** — there is an 85% chance
- **50% confidence** — there is a 50% chance (the median outcome)

Use the 85th percentile for commitments where reliability matters. Use the 50th percentile for internal planning targets.

---

### How Long Will It Take?

Answers: *Given a target number of items, how long are we likely to take?*

Set a target item count, simulation count, and optional start date, then click **Run Simulation**. The simulation randomly samples daily throughput and accumulates it until the target is reached, recording how many days that took.

**Results:**
- **50% confidence** — there is a 50% chance of finishing within this many days
- **85% confidence** — there is an 85% chance
- **95% confidence** — there is a 95% chance

If you provide a start date, projected completion dates are shown alongside the day counts.

Use the 85th percentile when setting deadlines or communicating timelines to stakeholders.

---

## Reference

### Metric Definitions

| Metric | Definition |
|---|---|
| Cycle time | Days from first in-progress entry to terminal state entry, inclusive |
| Aging WIP | Days an active item has been in progress without reaching a terminal state |
| Throughput | Count of items entering a terminal state within a time window |
| Arrival rate | Count of items entering the first in-progress state within a time window |
| WIP age | Average aging WIP across all currently active items |

### Percentile Interpretation

Percentiles describe what is true for a given percentage of observations. A 85th percentile cycle time of 12 days means 85% of items completed in 12 days or fewer. In forecasting, percentiles are inverted: an 85% confidence forecast means there is an 85% chance the outcome is at or better than the stated value.

### CSV Column Reference

| Column | Required | Format | Notes |
|---|---|---|---|
| `id` | Yes | Any string | Must be unique per item |
| `title` | Yes | Any string | Human-readable description |
| State columns | One or more | `YYYY-MM-DD` or `MM/DD/YYYY` | Named as `StateName` or `entered_StateName` — both are accepted |

### Privacy

All data is processed entirely in your browser. Nothing is uploaded, transmitted, or stored on any server. You can verify this by opening your browser's developer tools and observing the Network tab while uploading a file — no outbound requests will appear. See the Privacy page in the application for full details.
