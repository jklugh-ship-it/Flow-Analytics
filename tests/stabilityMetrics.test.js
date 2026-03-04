import { describe, it, expect } from "vitest";
import { computeAgingWip } from "../src/utils/metrics/computeAgingWip";
import { computeArrivalRate } from "../src/utils/metrics/computeArrivalRate";
import { computeThroughput } from "../src/utils/metrics/computeThroughput";
import { computeStability } from "../src/utils/metrics/computeStability";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function utc(str) {
  return new Date(`${str}T00:00:00.000Z`);
}

// -------------------------------------------------------
// computeAgingWip
// -------------------------------------------------------

describe("computeAgingWip", () => {
  const workflowStates = ["Backlog", "In Progress", "Done"];

  it("returns an empty array when no items are provided", () => {
    expect(computeAgingWip([], workflowStates)).toEqual([]);
  });

  it("excludes completed items (those with a cycleEnd)", () => {
    const items = [
      {
        id: "1",
        cycleStart: utc("2024-01-01"),
        cycleEnd: utc("2024-01-05"),
        entered: { "entered_In Progress": utc("2024-01-01") }
      }
    ];
    expect(computeAgingWip(items, workflowStates)).toEqual([]);
  });

  it("excludes items that have not yet started (no cycleStart)", () => {
    const items = [
      {
        id: "1",
        cycleStart: null,
        cycleEnd: null,
        entered: {}
      }
    ];
    expect(computeAgingWip(items, workflowStates)).toEqual([]);
  });

  it("includes active items and returns their current state and age", () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Start 5 days ago
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setUTCDate(fiveDaysAgo.getUTCDate() - 5);

    const items = [
      {
        id: "42",
        cycleStart: fiveDaysAgo,
        cycleEnd: null,
        entered: {
          "entered_In Progress": fiveDaysAgo
        }
      }
    ];

    const result = computeAgingWip(items, workflowStates);

    expect(result.length).toBe(1);
    expect(result[0].id).toBe("42");
    expect(result[0].ageDays).toBe(6); // inclusive
    expect(result[0].state).toBe("In Progress");
  });
});

// -------------------------------------------------------
// computeArrivalRate
// Note: tests use the fixed version that accepts firstInProgressState
// -------------------------------------------------------

describe("computeArrivalRate", () => {
  const start = utc("2024-01-01");
  const end = utc("2024-01-07"); // 6 day window

  it("returns a daily rate for items within the window", () => {
    const items = [
      { "entered_Ready": utc("2024-01-03") },
      { "entered_Ready": utc("2024-01-05") },
      { "entered_Ready": utc("2024-01-10") } // outside window
    ];
    // 2 items / 6 days = 0.33
    expect(computeArrivalRate(items, start, end, "Ready")).toBe(0.33);
  });

  it("returns zero when no items fall within the window", () => {
    const items = [
      { "entered_Ready": utc("2024-02-01") }
    ];
    expect(computeArrivalRate(items, start, end, "Ready")).toBe(0);
  });

  it("returns zero when items have no matching state entry", () => {
    const items = [
      { "entered_Done": utc("2024-01-03") }
    ];
    expect(computeArrivalRate(items, start, end, "Ready")).toBe(0);
  });

  it("includes items on the boundary dates", () => {
    const items = [
      { "entered_Ready": start },
      { "entered_Ready": end }
    ];
    // 2 items / 6 days = 0.33
    expect(computeArrivalRate(items, start, end, "Ready")).toBe(0.33);
  });

  it("returns 1.0 when one item arrives per day", () => {
    const items = [
      { "entered_Ready": utc("2024-01-01") },
      { "entered_Ready": utc("2024-01-02") },
      { "entered_Ready": utc("2024-01-03") },
      { "entered_Ready": utc("2024-01-04") },
      { "entered_Ready": utc("2024-01-05") },
      { "entered_Ready": utc("2024-01-06") },
    ];
    // 6 items / 6 days = 1.0
    expect(computeArrivalRate(items, start, end, "Ready")).toBe(1);
  });
});

// -------------------------------------------------------
// computeThroughput
// Note: tests use the fixed version that accepts lastState
// -------------------------------------------------------

describe("computeThroughput", () => {
  const start = utc("2024-01-01");
  const end = utc("2024-01-07"); // 6 day window

  it("returns a daily rate for items completed within the window", () => {
    const items = [
      { "entered_Done": utc("2024-01-02") },
      { "entered_Done": utc("2024-01-06") },
      { "entered_Done": utc("2024-01-15") } // outside
    ];
    // 2 items / 6 days = 0.33
    expect(computeThroughput(items, start, end, "Done")).toBe(0.33);
  });

  it("returns zero when no items are completed in the window", () => {
    const items = [{ "entered_Done": utc("2024-02-01") }];
    expect(computeThroughput(items, start, end, "Done")).toBe(0);
  });

  it("includes items on boundary dates", () => {
    const items = [
      { "entered_Done": start },
      { "entered_Done": end }
    ];
    // 2 items / 6 days = 0.33
    expect(computeThroughput(items, start, end, "Done")).toBe(0.33);
  });

  it("works with any state name", () => {
    const items = [
      { "entered_Released": utc("2024-01-03") },
      { "entered_Released": utc("2024-01-04") }
    ];
    // 2 items / 6 days = 0.33
    expect(computeThroughput(items, start, end, "Released")).toBe(0.33);
  });
});

// -------------------------------------------------------
// computeStability
// Note: tests use the fixed version that accepts workflowStates
// -------------------------------------------------------

describe("computeStability", () => {
  const workflowStates = ["Ready", "In Progress", "Done"];
  const inProgressStates = ["In Progress"];

  it("returns a stability object with today, lastWeek, and lastMonth keys", () => {
    const result = computeStability([], inProgressStates, new Date(), workflowStates);
    expect(result).toHaveProperty("today");
    expect(result).toHaveProperty("lastWeek");
    expect(result).toHaveProperty("lastMonth");
  });

  it("each period has arrivalRate, throughput, and wipAge", () => {
    const result = computeStability([], inProgressStates, new Date(), workflowStates);
    ["today", "lastWeek", "lastMonth"].forEach((period) => {
      expect(result[period]).toHaveProperty("arrivalRate");
      expect(result[period]).toHaveProperty("throughput");
      expect(result[period]).toHaveProperty("wipAge");
    });
  });

  it("returns zero counts when given no items", () => {
    const result = computeStability([], inProgressStates, new Date(), workflowStates);
    expect(result.today.arrivalRate).toBe(0);
    expect(result.today.throughput).toBe(0);
    expect(result.lastWeek.arrivalRate).toBe(0);
    expect(result.lastMonth.throughput).toBe(0);
  });

  it("counts items completed today in today throughput", () => {
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);

    const items = [{ "entered_Done": today }];
    const result = computeStability(items, inProgressStates, new Date(), workflowStates);
    expect(result.today.throughput).toBeGreaterThan(0);
  });

  it("counts items from the last 30 days in lastMonth throughput", () => {
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setUTCDate(twentyDaysAgo.getUTCDate() - 20);
    twentyDaysAgo.setUTCHours(0, 0, 0, 0);

    const items = [{ "entered_Done": twentyDaysAgo }];
    const result = computeStability(items, inProgressStates, new Date(), workflowStates);
    expect(result.lastMonth.throughput).toBeGreaterThan(0);
  });

  it("counts arrival rate using the first in-progress workflow state", () => {
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);

    const items = [{ "entered_In Progress": today }];
    const result = computeStability(items, inProgressStates, new Date(), workflowStates);
    expect(result.today.arrivalRate).toBeGreaterThan(0);
  });

  it("returns 0 arrival rate when workflow in-progress state name does not match item data", () => {
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);

    const differentWorkflow = ["Backlog", "Active", "Closed"];
    const items = [{ "entered_In Progress": today }];
    const result = computeStability(items, ["Active"], new Date(), differentWorkflow);
    expect(result.today.arrivalRate).toBe(0);
  });

  it("WIP age differs across periods based on historical snapshot date", () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Item started 20 days ago, still in progress
    const twentyDaysAgo = new Date(today);
    twentyDaysAgo.setUTCDate(twentyDaysAgo.getUTCDate() - 20);

    const items = [{
      "entered_In Progress": twentyDaysAgo,
      cycleEnd: null
    }];

    const result = computeStability(items, inProgressStates, today, workflowStates);

    // Today: item has been active for 21 days (inclusive)
    // Last week (7 days ago): item was 14 days old
    // Last month (30 days ago): item hadn't started yet, so 0
    expect(result.today.wipAge).toBeGreaterThan(result.lastWeek.wipAge);
    expect(result.lastWeek.wipAge).toBeGreaterThan(0);
    expect(result.lastMonth.wipAge).toBe(0);
  });

  it("WIP age is a decimal average across multiple items", () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);

    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setUTCDate(fiveDaysAgo.getUTCDate() - 5);

    const items = [
      { "entered_In Progress": threeDaysAgo, cycleEnd: null },
      { "entered_In Progress": fiveDaysAgo, cycleEnd: null }
    ];

    const result = computeStability(items, inProgressStates, today, workflowStates);

    // 4 days (inclusive) and 6 days (inclusive) → average 5.0
    expect(result.today.wipAge).toBe(5);
  });
});
