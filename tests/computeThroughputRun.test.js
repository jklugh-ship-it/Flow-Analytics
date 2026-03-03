import { describe, it, expect } from "vitest";
import { computeThroughputRun } from "../src/utils/metrics/computeThroughputRun";
import { parseDate } from "../src/utils/date/parseDate";
import { formatDate } from "../src/utils/metrics/formatDate";

describe("computeThroughputRun", () => {
  it("computes throughput per day from earliest entry date to today", () => {
    const items = [
      {
        id: 1,
        cycleStart: "2024-01-01",
        cycleEnd: "2024-01-02",
        entered: {
          Ready: "2024-01-01",
          Accepted: "2024-01-02"
        }
      },
      {
        id: 2,
        cycleStart: "2024-01-01",
        cycleEnd: "2024-01-03",
        entered: {
          Ready: "2024-01-01",
          Accepted: "2024-01-03"
        }
      }
    ];

    const tp = computeThroughputRun(items);

    // --- Expected start date (earliest entry across all states) ---
    expect(tp[0].date).toBe("2024-01-01");

    // --- Expected end date (today, UTC midnight) ---
    const today = new Date();
    const todayIso = formatDate(today);
    expect(tp[tp.length - 1].date).toBe(todayIso);

    // --- Validate completion counts dynamically ---
    const completionsByDate = {};
    items.forEach((i) => {
      const end = parseDate(i.cycleEnd);
      const iso = formatDate(end);
      completionsByDate[iso] = (completionsByDate[iso] || 0) + 1;
    });

    tp.forEach((row) => {
      const expected = completionsByDate[row.date] || 0;
      expect(row.count).toBe(expected);
    });
  });
});