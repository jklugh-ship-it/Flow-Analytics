// src/tests/setItems.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";

describe("setItems ingestion", () => {
  beforeEach(() => {
    useAnalyticsStore.setState({
      items: [],
      workflowStates: [],
      metrics: null,
      summary: null
    });
  });

  it("ingests items, stores them, and computes metrics + summary", () => {
    const raw = [
      {
        id: 1,
        created: "2024-01-01",
        completed: "2024-01-05",
        entered: {
          Refinement: "2024-01-01",
          Development: "2024-01-02",
          Testing: "2024-01-03",
          Done: "2024-01-05"
        }
      }
    ];

    act(() => {
      useAnalyticsStore.getState().setItems(raw);
    });

    const state = useAnalyticsStore.getState();

    // Items stored exactly as provided
    expect(state.items.length).toBe(1);
    expect(state.items[0]).toEqual(raw[0]);

    // Workflow states are whatever the store sets (no inference expected)
    expect(Array.isArray(state.workflowStates)).toBe(true);

    // Metrics computed
    expect(state.metrics).toBeTruthy();

    // Summary computed
    expect(state.summary).toBeTruthy();
  });
});