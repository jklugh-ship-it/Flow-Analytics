// src/tests/setItems.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAnalyticsStore } from "../store/useAnalyticsStoreStore";
import { act } from "@testing-library/react";

describe("setItems ingestion", () => {
  beforeEach(() => {
    useAnalyticsStore.setState({
      items: [],
      workflowStates: ["Refinement", "Development", "Testing", "Done"],
      metrics: null,
      summary: null
    });
  });

  it("ingests items, normalizes them, and computes metrics", () => {
    const raw = [
      {
        id: 1,
        created_date: "2024-01-01",
        entered_Refinement: "2024-01-02",
        entered_Development: "2024-01-03",
        entered_Testing: "2024-01-04",
        entered_Done: "2024-01-05",
        completed_date: "2024-01-05"
      }
    ];

    act(() => {
      useAppStore.getState().setItems(raw);
    });

    const state = useAnalyticsStore.getState();

    expect(state.items.length).toBe(1);
    expect(state.items[0].transitions.Refinement).toBeInstanceOf(Date);
    expect(state.metrics).toBeTruthy();
    expect(state.summary).toBeTruthy();
  });
});