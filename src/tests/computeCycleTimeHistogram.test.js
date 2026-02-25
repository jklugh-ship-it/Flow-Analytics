import { describe, it, expect } from "vitest";
import {
  computeCycleTimeHistogram,
  parseDate,
  daysBetween
} from "../utils/metrics";

describe("computeCycleTimeHistogram", () => {
  it("returns an empty array when no items are provided", () => {
    expect(computeCycleTimeHistogram([])).toEqual([]);
    expect(computeCycleTimeHistogram(null)).toEqual([]);
  });

  it("buckets items by whole-day cycle time", () => {
    const items = [
      {
        created: "2024-01-01",
        completed: "2024-01-05" // CT = 4
      },
      {
        created: "2024-01-02",
        completed: "2024-01-05" // CT = 3
      },
      {
        created: "2024-01-03",
        completed: "2024-01-05" // CT = 2
      }
    ];

    const hist = computeCycleTimeHistogram(items);

    // Build expected dynamically
    const expectedBuckets = {};
    items.forEach((i) => {
      const ct = daysBetween(parseDate(i.created), parseDate(i.completed));
      expectedBuckets[ct] = (expectedBuckets[ct] || 0) + 1;
    });

    const expected = Object.entries(expectedBuckets).map(([value, count]) => ({
      value: Number(value),
      count
    }));

    expect(hist).toEqual(expected);
  });

  it("groups multiple items with the same cycle time into the same bucket", () => {
    const items = [
      { created: "2024-01-01", completed: "2024-01-04" }, // CT = 3
      { created: "2024-01-02", completed: "2024-01-05" }, // CT = 3
      { created: "2024-01-03", completed: "2024-01-06" }  // CT = 3
    ];

    const hist = computeCycleTimeHistogram(items);

    expect(hist.length).toBe(1);
    expect(hist[0]).toEqual({ value: 3, count: 3 });
  });

  it("ignores items missing created or completed dates", () => {
    const items = [
      { created: "2024-01-01", completed: "2024-01-05" }, // valid
      { created: "2024-01-02", completed: null },         // ignored
      { created: null, completed: "2024-01-05" },         // ignored
      { created: null, completed: null }                  // ignored
    ];

    const hist = computeCycleTimeHistogram(items);

    expect(hist.length).toBe(1);
    expect(hist[0].count).toBe(1);
  });

  it("ignores items with invalid dates", () => {
    const items = [
      { created: "2024-01-01", completed: "2024-01-05" }, // valid
      { created: "not-a-date", completed: "2024-01-05" }, // invalid
      { created: "2024-01-01", completed: "2024-99-99" }  // invalid
    ];

    const hist = computeCycleTimeHistogram(items);

    expect(hist.length).toBe(1);
    expect(hist[0].count).toBe(1);
  });
});