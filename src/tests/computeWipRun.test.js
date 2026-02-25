import { describe, it, expect } from "vitest";
import { computeWipRun } from "../utils/metrics";

// Local date formatter matching formatDate()
function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("computeWipRun", () => {
  it("computes WIP counts per day from earliest date to today", () => {
    const items = [
      {
        id: 1,
        created: new Date(2024, 0, 1),
        completed: new Date(2024, 0, 3)
      },
      {
        id: 2,
        created: new Date(2024, 0, 2),
        completed: null
      }
    ];

    const wip = computeWipRun(items);

    const allDates = items
      .flatMap((i) => [i.created, i.completed].filter(Boolean))
      .filter((d) => d instanceof Date);

    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    minDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expectedDates = [];
    let cursor = new Date(minDate);

    while (cursor <= today) {
      expectedDates.push(fmt(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    expect(wip.length).toBe(expectedDates.length);

    const expectedWipForDate = (iso) => {
      const [y, m, d] = iso.split("-").map(Number);
      const day = new Date(y, m - 1, d); // LOCAL midnight

      return items.filter((item) => {
        const start = new Date(item.created);
        start.setHours(0, 0, 0, 0);

        let end = null;
        if (item.completed instanceof Date) {
          end = new Date(item.completed);
          end.setHours(0, 0, 0, 0);
        }

        return start <= day && (!end || end > day);
      }).length;
    };

    wip.forEach((row) => {
      const expected = expectedWipForDate(row.date);
      expect(row.count).toBe(expected);
    });
  });
});