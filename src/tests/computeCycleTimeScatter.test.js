import { describe, it, expect } from "vitest";
import {
  computeCycleTimeScatter,
  parseDate,
  daysBetween
} from "../utils/metrics";

describe("computeCycleTimeScatter", () => {
  it("returns an empty array when no items are provided", () => {
    expect(computeCycleTimeScatter([])).toEqual([]);
    expect(computeCycleTimeScatter(null)).toEqual([]);
  });

  it("maps items to { date, value } points using completed date and cycle time", () => {
    const items = [
      {
        created: "2024-01-01",
        completed: "2024-01-05" // CT = 4
      },
      {
        created: "2024-01-02",
        completed: "2024-01-06" // CT = 4
      },
      {
        created: "2024-01-03",
        completed: "2024-01-10" // CT = 7
      }
    ];

    const scatter = computeCycleTimeScatter(items);

    // Build expected dynamically
    const expected = items.map((i) => {
      const start = parseDate(i.created);
      const end = parseDate(i.completed);
      const ct = daysBetween(start, end);

      return {
        date: i.completed,
        value: ct
      };
    });

    expect(scatter).toEqual(expected);
  });

  it("ignores items missing created or completed dates", () => {
    const items = [
      { created: "2024-01-01", completed: "2024-01-05" }, // valid
      { created: "2024-01-02", completed: null },         // ignored
      { created: null, completed: "2024-01-05" },         // ignored
      { created: null, completed: null }                  // ignored
    ];

    const scatter = computeCycleTimeScatter(items);

    expect(scatter.length).toBe(1);
    expect(scatter[0].date).toBe("2024-01-05");
  });

  it("ignores items with invalid dates", () => {
    const items = [
      { created: "2024-01-01", completed: "2024-01-05" }, // valid
      { created: "not-a-date", completed: "2024-01-05" }, // invalid
      { created: "2024-01-01", completed: "2024-99-99" }  // invalid
    ];

    const scatter = computeCycleTimeScatter(items);

    expect(scatter.length).toBe(1);
    expect(scatter[0].value).toBe(
      daysBetween(parseDate("2024-01-01"), parseDate("2024-01-05"))
    );
  });

  it("preserves input order", () => {
    const items = [
      { created: "2024-01-01", completed: "2024-01-05" },
      { created: "2024-01-02", completed: "2024-01-06" },
      { created: "2024-01-03", completed: "2024-01-07" }
    ];

    const scatter = computeCycleTimeScatter(items);

    expect(scatter.map((p) => p.date)).toEqual([
      "2024-01-05",
      "2024-01-06",
      "2024-01-07"
    ]);
  });
});