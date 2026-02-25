import { describe, it, expect } from "vitest";
import { computeThroughputRun } from "../utils/metrics";

describe("computeThroughputRun", () => {
  it("computes throughput per day from earliest entry date to today", () => {
    const items = [
      {
        id: 1,
        created: "2024-01-01",
        entered: { Done: "2024-01-02" }
      },
      {
        id: 2,
        created: "2024-01-01",
        entered: { Done: "2024-01-03" }
      }
    ];

    const tp = computeThroughputRun(items);

    // --- Expected start date ---
    const earliestEntry = "2024-01-01";

    expect(tp[0].date).toBe(earliestEntry);

    // --- Expected end date ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);

    expect(tp[tp.length - 1].date).toBe(todayIso);

    // --- Validate completion counts dynamically ---
    const completionsByDate = {};
    items.forEach((i) => {
      const d = i.entered.Done;
      completionsByDate[d] = (completionsByDate[d] || 0) + 1;
    });

    tp.forEach((row) => {
      const expected = completionsByDate[row.date] || 0;
      expect(row.count).toBe(expected);
    });
  });
});