import { describe, it, expect } from "vitest";
import { parseDate } from "../utils/metrics";

describe("parseDate", () => {
  it("returns null for null/undefined/empty", () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate("")).toBeNull();
  });

  it("returns the same Date instance when given a Date", () => {
    const d = new Date("2024-01-01");
    expect(parseDate(d)).toBe(d);
  });

  it("parses ISO date strings", () => {
    const d = parseDate("2024-01-01");
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString().slice(0, 10)).toBe("2024-01-01");
  });

  it("parses MM/DD/YYYY format", () => {
    const d = parseDate("02/15/2024");
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString().slice(0, 10)).toBe("2024-02-15");
  });

  it("returns null for invalid strings", () => {
    expect(parseDate("not-a-date")).toBeNull();
    expect(parseDate("2024-99-99")).toBeNull();
    expect(parseDate("13/40/2024")).toBeNull();
  });
});