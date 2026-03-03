import { describe, it, expect } from "vitest";
import { computeCycleTimePercentiles } from "../src/utils/metrics/computeCycleTimePercentiles";

// Helper to build items with cycleStart/cycleEnd strings
function item(start, end) {
  return {
    cycleStart: start,
    cycleEnd: end
  };
}

describe("computeCycleTimePercentiles", () => {
  it("returns nulls for all percentiles when given no items", () => {
    const out = computeCycleTimePercentiles([]);
    expect(out).toEqual({
      p50: null,
      p70: null,
      p85: null,
      p95: null
    });
  });

  it("ignores items with missing or invalid dates", () => {
    const items = [
      item("2024-01-01", "2024-01-01"), // valid → cycle time = 1
      item("2024-01-02", null),         // invalid
      item(null, "2024-01-03"),         // invalid
      item("not-a-date", "2024-01-10")  // invalid
    ];

    const out = computeCycleTimePercentiles(items);

    expect(out.p50).toBeGreaterThan(0);
    expect(out.p70).toBe(out.p50);
    expect(out.p85).toBe(out.p50);
    expect(out.p95).toBe(out.p50);
  });

  it("computes correct percentiles for a simple sorted list", () => {
    // Cycle times: 1, 2, 3, 4, 5
    const items = [
      item("2024-01-01", "2024-01-01"), // 1
      item("2024-01-01", "2024-01-02"), // 2
      item("2024-01-01", "2024-01-03"), // 3
      item("2024-01-01", "2024-01-04"), // 4
      item("2024-01-01", "2024-01-05")  // 5
    ];

    const out = computeCycleTimePercentiles(items);

    expect(out.p50).toBe(3);  // median
    expect(out.p70).toBe(4);  // idx = 2.8 → 3.2 → round = 4
    expect(out.p85).toBe(4);  // idx = 3.4 → 4.4 → round = 4
    expect(out.p95).toBe(5);  // idx = 3.8 → 4.2 → round = 4
  });

  it("performs linear interpolation for non-integer percentile indices", () => {
    // Cycle times: 10, 20, 30, 40
    const items = [
      item("2024-01-01", "2024-01-10"), // 10
      item("2024-01-01", "2024-01-20"), // 20
      item("2024-01-01", "2024-01-30"), // 30
      item("2024-01-01", "2024-02-09")  // 40
    ];

    const out = computeCycleTimePercentiles(items);

    expect(out.p50).toBe(25); // idx = 1.5 → 20 + 0.5*(30-20)
    expect(out.p70).toBe(31); // idx = 2.1 → 30 + 0.1*(40-30)
    expect(out.p85).toBe(36); // idx = 2.55 → 30 + 0.55*(40-30)
    expect(out.p95).toBe(39); // idx = 2.85 → 30 + 0.85*(40-30)
  });

  it("sorts cycle times before computing percentiles", () => {
    // Cycle times: 5, 10, 15
    const items = [
      item("2024-01-01", "2024-01-05"), // 5
      item("2024-01-01", "2024-01-10"), // 10
      item("2024-01-01", "2024-01-15")  // 15
    ];

    const out = computeCycleTimePercentiles(items);

    expect(out.p50).toBe(10); // median
    expect(out.p70).toBe(12); // idx = 1.4 → 10 + 0.4*(15-10)
    expect(out.p85).toBe(14); // idx = 1.7 → 10 + 0.7*(15-10)
    expect(out.p95).toBe(15); // idx = 1.9 → 10 + 0.9*(15-10)
  });

  it("handles the case where all cycle times are identical", () => {
    // Cycle times: 5, 5, 5
    const items = [
      item("2024-01-01", "2024-01-05"), // 5
      item("2024-01-02", "2024-01-06"), // 5
      item("2024-01-03", "2024-01-07")  // 5
    ];

    const out = computeCycleTimePercentiles(items);

    expect(out.p50).toBe(5);
    expect(out.p70).toBe(5);
    expect(out.p85).toBe(5);
    expect(out.p95).toBe(5);
  });
});