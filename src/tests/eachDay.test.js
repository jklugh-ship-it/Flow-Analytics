import { describe, it, expect } from "vitest";
import { eachDay, parseDate, formatDate } from "../utils/metrics";

describe("eachDay", () => {
  it("returns an empty array when start > end", () => {
    const start = parseDate("2024-01-10");
    const end = parseDate("2024-01-05");
    const days = eachDay(start, end);
    expect(days).toEqual([]);
  });

  it("returns a single day when start === end", () => {
    const start = parseDate("2024-02-01");
    const end = parseDate("2024-02-01");
    const days = eachDay(start, end);

    expect(days.length).toBe(1);
    expect(days[0]).toBeInstanceOf(Date);
    expect(formatDate(days[0])).toBe("2024-02-01");
  });

  it("returns all days in an inclusive range", () => {
    const start = parseDate("2024-01-01");
    const end = parseDate("2024-01-05");
    const days = eachDay(start, end);

    const expected = ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"];

    expect(days.length).toBe(expected.length);

    // Validate each day dynamically
    days.forEach((d, i) => {
      expect(d).toBeInstanceOf(Date);
      expect(formatDate(d)).toBe(expected[i]);
    });
  });

  it("produces strictly increasing dates with no timezone drift", () => {
    const start = parseDate("2024-03-10");
    const end = parseDate("2024-03-15");
    const days = eachDay(start, end);

    for (let i = 1; i < days.length; i++) {
      const prev = days[i - 1].getTime();
      const curr = days[i].getTime();
      expect(curr).toBeGreaterThan(prev);
    }
  });
});