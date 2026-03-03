import { describe, it, expect } from "vitest";
import { computeWipRun } from "../src/utils/metrics/computeWipRun";
import { parseDate } from "../src/utils/date/parseDate";
import { formatDate } from "../src/utils/metrics/formatDate";

describe("computeWipRun", () => {
  it("computes WIP counts per day from earliest cycleStart to today", () => {
    const items = [
      {
        id: 1,
        cycleStart: "2024-01-01",
        cycleEnd: "2024-01-03"
      },
      {
        id: 2,
        cycleStart: "2024-01-02",
        cycleEnd: null // still in progress
      }
    ];

    const wip = computeWipRun(items);

    // --- Determine expected date range ---
    const allDates = [];

    items.forEach((i) => {
      const start = parseDate(i.cycleStart);
      const end = parseDate(i.cycleEnd);
      if (start) allDates.push(start);
      if (end) allDates.push(end);
    });

    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const today = new Date();
    const todayIso = formatDate(today);

    const expectedDates = [];
    let cursor = new Date(minDate);

    while (formatDate(cursor) <= todayIso) {
      expectedDates.push(formatDate(cursor));
      cursor = new Date(Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() + 1
      ));
    }

    expect(wip.length).toBe(expectedDates.length);

    // --- Expected WIP calculation ---
    const expectedWipForDate = (iso) => {
      const day = parseDate(iso);

      return items.filter((item) => {
        const start = parseDate(item.cycleStart);
        const end = parseDate(item.cycleEnd);

        return (
          start &&
          start <= day &&
          (!end || end > day)
        );
      }).length;
    };

    // --- Validate each row ---
    wip.forEach((row) => {
      const expected = expectedWipForDate(row.date);
      expect(row.count).toBe(expected);
    });
  });
});