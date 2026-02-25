import { describe, it, expect } from "vitest";
import { computeThroughputRun } from "../utils/metrics";

describe("computeThroughputRun", () => {
  it("computes throughput per day from earliest entry date to today", () => {
    const items = [
      {
        id: 1,
        created: new Date(2024, 0, 1), // Jan 1 2024 local
        completed: new Date(2024, 0, 2),
        entered: {
          Ready: new Date(2024, 0, 1),
          Accepted: new Date(2024, 0, 2)
        }
      },
      {
        id: 2,
        created: new Date(2024, 0, 1),
        completed: new Date(2024, 0, 3),
        entered: {
          Ready: new Date(2024, 0, 1),
          Accepted: new Date(2024, 0, 3)
        }
      }
    ];

    const tp = computeThroughputRun(items);

    // --- Expected start date ---
    expect(tp[0].date).toBe("2024-01-01");

    // --- Expected end date ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);
    expect(tp[tp.length - 1].date).toBe(todayIso);

    // --- Validate completion counts dynamically ---
    const completionsByDate = {};
    items.forEach((i) => {
      const iso = i.completed.toISOString().slice(0, 10);
      completionsByDate[iso] = (completionsByDate[iso] || 0) + 1;
    });

    tp.forEach((row) => {
      const expected = completionsByDate[row.date] || 0;
      expect(row.count).toBe(expected);
    });
  });
});