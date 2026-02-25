import { describe, it, expect } from "vitest";
import { daysBetween, parseDate } from "../utils/metrics";

describe("daysBetween", () => {
  it("returns null when either date is missing", () => {
    const d = new Date("2024-01-01");
    expect(daysBetween(null, d)).toBeNull();
    expect(daysBetween(d, null)).toBeNull();
    expect(daysBetween(null, null)).toBeNull();
  });

  it("computes positive day differences", () => {
    const a = parseDate("2024-01-01");
    const b = parseDate("2024-01-05");
    expect(daysBetween(a, b)).toBe(4);
  });

  it("computes zero-day difference when dates are equal", () => {
    const a = parseDate("2024-01-10");
    const b = parseDate("2024-01-10");
    expect(daysBetween(a, b)).toBe(0);
  });

  it("computes negative differences when end < start", () => {
    const a = parseDate("2024-01-10");
    const b = parseDate("2024-01-05");
    expect(daysBetween(a, b)).toBe(-5);
  });

  it("works with Date objects directly", () => {
    const a = new Date("2024-02-01");
    const b = new Date("2024-02-10");
    expect(daysBetween(a, b)).toBe(9);
  });
});