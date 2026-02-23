// src/tests/normalizeItems.test.js
import { describe, it, expect } from "vitest";
import { normalizeItems } from "../utils/metrics";

describe("normalizeItems", () => {
  const workflow = ["Refinement", "Development", "Testing", "Done"];

  it("normalizes basic items with direct transitions", () => {
    const raw = [
      {
        id: 1,
        created_date: "2024-01-01",
        entered_Refinement: "2024-01-02",
        entered_Development: "2024-01-05",
        entered_Testing: "2024-01-10",
        entered_Done: "2024-01-12",
        completed_date: "2024-01-12"
      }
    ];

    const items = normalizeItems(raw, workflow);

    expect(items.length).toBe(1);
    expect(items[0].transitions.Refinement).toBeInstanceOf(Date);
    expect(items[0].cycleTime).toBe(10); // Jan 2 → Jan 12
  });

  it("enforces monotonicity when transitions go backwards", () => {
    const raw = [
      {
        id: 1,
        entered_Refinement: "2024-01-10",
        entered_Development: "2024-01-05", // backwards
        entered_Testing: "2024-01-20",
        entered_Done: "2024-01-25",
        completed_date: "2024-01-25"
      }
    ];

    const items = normalizeItems(raw, workflow);

    expect(items[0].transitions.Development >= items[0].transitions.Refinement)
      .toBe(true);
  });

  it("infers transitions backwards when completed but no transitions exist", () => {
    const raw = [
      {
        id: 1,
        completed_date: "2024-01-20"
      }
    ];

    const items = normalizeItems(raw, workflow);

    expect(items[0].transitions.Done).toBeInstanceOf(Date);
    expect(items[0].transitions.Refinement).toBeInstanceOf(Date);
  });
});