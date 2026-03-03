import { describe, it, expect } from "vitest";
import { computeCycleTimeHistogram } from "../src/utils/metrics/computeCycleTimeHistogram";
import { parseDate } from "../src/utils/date/parseDate";
import { daysBetween } from "../src/utils/date/daysBetween";

describe("computeCycleTimeHistogram", () => {
  it("returns an empty array when no items are provided", () => {
    expect(computeCycleTimeHistogram([])).toEqual([]);
    expect(computeCycleTimeHistogram(null)).toEqual([]);
  });

  it("buckets items by whole-day cycle time", () => {
    const items = [
      { cycleStart: "2024-01-01", cycleEnd: "2024-01-05" }, // CT = 4
      { cycleStart: "2024-01-02", cycleEnd: "2024-01-05" }, // CT = 3
      { cycleStart: "2024-01-03", cycleEnd: "2024-01-05" }  // CT = 2
    ];

    const hist = computeCycleTimeHistogram(items);

    // Build expected dynamically
    const expectedBuckets = {};
    items.forEach((i) => {
      const ct = daysBetween(parseDate(i.cycleStart), parseDate(i.cycleEnd));
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
      { cycleStart: "2024-01-01", cycleEnd: "2024-01-04" }, // CT = 3
      { cycleStart: "2024-01-02", cycleEnd: "2024-01-05" }, // CT = 3
      { cycleStart: "2024-01-03", cycleEnd: "2024-01-06" }  // CT = 3
    ];

    const hist = computeCycleTimeHistogram(items);

    expect(hist.length).toBe(1);
    expect(hist[0]).toEqual({ value: 3, count: 3 });
  });

  it("ignores items missing cycleStart or cycleEnd", () => {
    const items = [
      { cycleStart: "2024-01-01", cycleEnd: "2024-01-05" }, // valid
      { cycleStart: "2024-01-02", cycleEnd: null },         // ignored
      { cycleStart: null, cycleEnd: "2024-01-05" },         // ignored
      { cycleStart: null, cycleEnd: null }                  // ignored
    ];

    const hist = computeCycleTimeHistogram(items);

    expect(hist.length).toBe(1);
    expect(hist[0].count).toBe(1);
  });

  it("ignores items with invalid dates", () => {
    const items = [
      { cycleStart: "2024-01-01", cycleEnd: "2024-01-05" }, // valid
      { cycleStart: "not-a-date", cycleEnd: "2024-01-05" }, // invalid
      { cycleStart: "2024-01-01", cycleEnd: "2024-99-99" }  // invalid
    ];

    const hist = computeCycleTimeHistogram(items);

    expect(hist.length).toBe(1);
    expect(hist[0].count).toBe(1);
  });
});