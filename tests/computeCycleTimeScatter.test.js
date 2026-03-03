import { describe, it, expect } from "vitest";
import { computeCycleTimeScatter } from "../src/utils/metrics/computeCycleTimeScatter";
import { parseDate } from "../src/utils/date/parseDate";
import { daysBetween } from "../src/utils/date/daysBetween";
import { formatDate } from "../src/utils/metrics/formatDate";

describe("computeCycleTimeScatter", () => {
  it("returns an empty array when no items are provided", () => {
    expect(computeCycleTimeScatter([])).toEqual([]);
    expect(computeCycleTimeScatter(null)).toEqual([]);
  });

  it("maps items to { date, value } points using cycleEnd and cycle time", () => {
    const items = [
      { cycleStart: "2024-01-01", cycleEnd: "2024-01-05" }, // CT = 4
      { cycleStart: "2024-01-02", cycleEnd: "2024-01-06" }, // CT = 4
      { cycleStart: "2024-01-03", cycleEnd: "2024-01-10" }  // CT = 7
    ];

    const scatter = computeCycleTimeScatter(items);

const expected = items.map((i) => {
  const start = parseDate(i.cycleStart);
  const end = parseDate(i.cycleEnd);
  const ct = daysBetween(start, end);

  return {
    date: formatDate(end),
    value: ct
  };
});

    expect(scatter).toEqual(expected);
  });

  it("ignores items missing cycleStart or cycleEnd", () => {
    const items = [
      { cycleStart: "2024-01-01", cycleEnd: "2024-01-05" }, // valid
      { cycleStart: "2024-01-02", cycleEnd: null },         // ignored
      { cycleStart: null, cycleEnd: "2024-01-05" },         // ignored
      { cycleStart: null, cycleEnd: null }                  // ignored
    ];

    const scatter = computeCycleTimeScatter(items);

    expect(scatter.length).toBe(1);
    expect(scatter[0].date).toBe("2024-01-05");
  });

  it("ignores items with invalid dates", () => {
    const items = [
      { cycleStart: "2024-01-01", cycleEnd: "2024-01-05" }, // valid
      { cycleStart: "not-a-date", cycleEnd: "2024-01-05" }, // invalid
      { cycleStart: "2024-01-01", cycleEnd: "2024-99-99" }  // invalid
    ];

    const scatter = computeCycleTimeScatter(items);

    expect(scatter.length).toBe(1);
    expect(scatter[0].value).toBe(
      daysBetween(parseDate("2024-01-01"), parseDate("2024-01-05"))
    );
  });

  it("preserves input order", () => {
    const items = [
      { cycleStart: "2024-01-01", cycleEnd: "2024-01-05" },
      { cycleStart: "2024-01-02", cycleEnd: "2024-01-06" },
      { cycleStart: "2024-01-03", cycleEnd: "2024-01-07" }
    ];

    const scatter = computeCycleTimeScatter(items);

    expect(scatter.map((p) => p.date)).toEqual([
      "2024-01-05",
      "2024-01-06",
      "2024-01-07"
    ]);
  });
});