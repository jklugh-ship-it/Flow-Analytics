import { describe, it, expect } from "vitest";
import { computeWipRun } from "../utils/metrics";

describe("computeWipRun", () => {
  it("computes WIP counts per day", () => {
    // --- Test fixture using new ingestion shape ---
    const items = [
      {
        id: 1,
        created: "2024-01-01",
        completed: "2024-01-03"
      },
      {
        id: 2,
        created: "2024-01-02",
        completed: null
      }
    ];

    const wip = computeWipRun(items);

    // --- Compute expected date range dynamically ---
    const allDates = items.flatMap((i) =>
      [i.created, i.completed].filter(Boolean)
    );

    const min = allDates.sort()[0];
    const max = allDates.sort()[allDates.length - 1];

    // Build expected date list
    const expectedDates = [];
    let cursor = new Date(min);
    const end = new Date(max);

    while (cursor <= end) {
      expectedDates.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }

    // --- Validate run length ---
    expect(wip.length).toBe(expectedDates.length);

    // --- Dynamic WIP calculation ---
    const expectedWipForDate = (date) =>
      items.filter((item) => {
        const start = item.created;
        const end = item.completed;
        return start <= date && (!end || end > date);
      }).length;

    // --- Validate each row dynamically ---
    wip.forEach((row) => {
      const expected = expectedWipForDate(row.date);
      expect(row.count).toBe(expected);
    });
  });
});