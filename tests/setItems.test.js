import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAnalyticsStore } from "../src/store/useAnalyticsStore";

// Fixed: correct path matches actual source location
vi.mock("../src/utils/recomputeCycleFields", () => ({
  recomputeCycleFields: (items) => items
}));

vi.mock("../src/utils/metrics/computeAllMetrics", () => ({
  computeAllMetrics: (items) => ({
    metrics: {
      cycleHistogram: [
        { value: 1, count: 1 },
        { value: 3, count: 1 },
        { value: 5, count: 1 }
      ],
      throughputRun: []
    },
    throughputHistory: []
  })
}));

function item(start, end) {
  return {
    cycleStart: `${start}T00:00:00.000Z`,
    cycleEnd: `${end}T00:00:00.000Z`,
    completed: true
  };
}

describe("setItems ingestion", () => {
  beforeEach(() => {
    useAnalyticsStore.getState().resetStore();
  });

  it("ingests items, stores them, and computes metrics + summary", () => {
    const items = [
      item("2024-01-01", "2024-01-05"),
      item("2024-01-02", "2024-01-04"),
      item("2024-01-03", "2024-01-03")
    ];

    useAnalyticsStore.getState().setItems(items);

    const state = useAnalyticsStore.getState();

    expect(state.items.length).toBe(3);
    // Weighted average of cycle times 1, 3, 5 = (1*1 + 3*1 + 5*1) / 3 = 3
    expect(state.summary.avgCycleTime).toBe(3);
  });

  it("stores zero items when given an empty array", () => {
    useAnalyticsStore.getState().setItems([]);
    expect(useAnalyticsStore.getState().items.length).toBe(0);
  });

  it("replaces previously loaded items on re-upload", () => {
    useAnalyticsStore.getState().setItems([item("2024-01-01", "2024-01-02")]);
    useAnalyticsStore.getState().setItems([
      item("2024-02-01", "2024-02-03"),
      item("2024-02-04", "2024-02-06")
    ]);

    expect(useAnalyticsStore.getState().items.length).toBe(2);
  });
});
