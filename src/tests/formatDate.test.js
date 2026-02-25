import { describe, it, expect } from "vitest";
import { formatDate, parseDate } from "../utils/metrics";

describe("formatDate", () => {
  it("formats a Date into YYYY-MM-DD", () => {
    const d = parseDate("2024-01-15");
    const out = formatDate(d);
    expect(out).toBe("2024-01-15");
  });

  it("drops time components and preserves the date", () => {
    const d = new Date("2024-03-10T23:59:59Z");
    const out = formatDate(d);
    expect(out).toBe("2024-03-10");
  });

  it("handles dates affected by timezone offsets", () => {
    // Construct a date that might shift in local timezone
    const d = new Date(Date.UTC(2024, 0, 5, 5, 0, 0)); // Jan 5, 2024 UTC
    const out = formatDate(d);

    // The output must always reflect the UTC date portion
    expect(out).toBe("2024-01-05");
  });

  it("throws if given a non-Date", () => {
    // formatDate assumes a valid Date; invalid input should explode
    expect(() => formatDate("2024-01-01")).toThrow();
    expect(() => formatDate(null)).toThrow();
    expect(() => formatDate(undefined)).toThrow();
  });
});