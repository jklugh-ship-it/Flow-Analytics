import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAnalyticsStore } from "../src/store/useAnalyticsStore";

vi.mock("../src/utils/recompute/recomputeEverything", () => ({
  recomputeEverything: vi.fn()
}));

vi.mock("../src/utils/recomputeCycleFields", () => ({
  recomputeCycleFields: (items) => items
}));

vi.mock("../src/utils/metrics/computeAllMetrics", () => ({
  computeAllMetrics: () => ({
    metrics: null,
    throughputHistory: []
  })
}));

describe("useAnalyticsStore", () => {
  beforeEach(() => {
    useAnalyticsStore.getState().resetStore();
  });

  it("resets the store to initial state", () => {
    const store = useAnalyticsStore.getState();

    store.setWorkflowStates(["A", "B"]);
    store.toggleWorkflowVisibility("A");
    store.setItems([{ id: 1 }]);

    store.resetStore();

    const after = useAnalyticsStore.getState();

    expect(after.items).toEqual([]);
    expect(after.workflowStates).toEqual(["A", "B"]);
    expect(after.workflowVisibility).toEqual({
      A: false,
      B: true
    });
    expect(after.inProgressStates).toEqual({
      A: false,
      B: false
    });
    expect(after.metrics).toEqual(null);
    expect(after.summary).toEqual(null);
  });

  it("sets workflow states and initializes visibility + in-progress", () => {
    const store = useAnalyticsStore.getState();

    store.setWorkflowStates(["A", "B", "C"]);

    const after = useAnalyticsStore.getState();

    expect(after.workflowStates).toEqual(["A", "B", "C"]);
    expect(after.workflowVisibility).toEqual({
      A: false,
      B: true,
      C: true
    });
    expect(after.inProgressStates).toEqual({
      A: false,
      B: true,
      C: false
    });
  });

  it("toggles workflow visibility", () => {
    const store = useAnalyticsStore.getState();

    store.setWorkflowStates(["A", "B"]);
    store.toggleWorkflowVisibility("A");

    expect(useAnalyticsStore.getState().workflowVisibility.A).toBe(true);

    store.toggleWorkflowVisibility("A");
    expect(useAnalyticsStore.getState().workflowVisibility.A).toBe(false);
  });

  it("toggles in-progress state", () => {
    const store = useAnalyticsStore.getState();

    store.setWorkflowStates(["A", "B", "C"]);
    store.toggleInProgressState("B");

    expect(useAnalyticsStore.getState().inProgressStates.B).toBe(false);

    store.toggleInProgressState("B");
    expect(useAnalyticsStore.getState().inProgressStates.B).toBe(true);
  });

  it("sets items and triggers metrics + summary", () => {
    const store = useAnalyticsStore.getState();

    store.setItems([
      { id: 1, cycleStart: "2024-01-01", cycleEnd: "2024-01-02" }
    ]);

    const after = useAnalyticsStore.getState();

    expect(after.items.length).toBe(1);
    expect(after.metrics).toBeNull();
    expect(after.summary).toBeNull();
  });
});