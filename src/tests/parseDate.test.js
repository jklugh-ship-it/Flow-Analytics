import { describe, it, expect } from "vitest";
import { parseDate } from "../utils/metrics";

describe("parseDate", () => {
  it("returns null for null/undefined/empty", () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate("")).toBeNull();
  });

  it("returns the same Date instance when given a Date", () => {
    const d = new Date("2024-01-01T00:00:00Z");
    expect(parseDate(d)).toBe(d);
  });

  it("parses ISO YYYY-MM-DD", () => {
    const d = parseDate("2024-01-01");
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString().slice(0, 10)).toBe("2024-01-01");
  });

  it("parses ISO timestamps", () => {
    const d = parseDate("2024-01-01T12:34:56Z");
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString().slice(0, 10)).toBe("2024-01-01");
  });

  it("parses MM/DD/YYYY format", () => {
    const d = parseDate("02/15/2024");
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString().slice(0, 10)).toBe("2024-02-15");
  });

  it("parses M/D/YYYY format", () => {
    const d = parseDate("8/5/2025");
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString().slice(0, 10)).toBe("2025-08-05");
  });

  it("rejects invalid strings", () => {
    expect(parseDate("not-a-date")).toBeNull();
    expect(parseDate("2024-99-99")).toBeNull();
    expect(parseDate("13/40/2024")).toBeNull();
  });

  it("rejects rollover dates", () => {
    expect(parseDate("2/32/2025")).toBeNull();
    expect(parseDate("2024-02-30")).toBeNull();
  });

  it("trims whitespace", () => {
    const d = parseDate("  8/11/2025  ");
    expect(d).toBeInstanceOf(Date);
    expect(d.toISOString().slice(0, 10)).toBe("2025-08-11");
  });

  it("produces stable UTC dates with no timezone drift", () => {
    const d = parseDate("8/11/2025");
    expect(d.toISOString()).toBe("2025-08-11T00:00:00.000Z");
  });
});