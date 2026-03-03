import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAnalyticsStore } from "../src/store/useAnalyticsStore";

// Mock recomputeCycleFields so items pass through unchanged
vi.mock("../utils/recomputeCycleFields", () => ({
  recomputeCycleFields: (items) => items
}));

// Mock computeAllMetrics so histogram is exactly what we want
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
    expect(state.summary.avgCycleTime).toBeCloseTo((5 + 3 + 1) / 3);
  });
});