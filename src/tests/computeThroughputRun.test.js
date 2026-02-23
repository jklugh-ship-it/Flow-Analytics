// src/tests/computeThroughputRun.test.js
import { describe, it, expect } from "vitest";
import { computeThroughputRun } from "../utils/metrics";

describe("computeThroughputRun", () => {
  const items = [
    { id: 1, completed: new Date("2024-01-02") },
    { id: 2, completed: new Date("2024-01-02") },
    { id: 3, completed: new Date("2024-01-03") }
  ];

  it("computes throughput per day", () => {
    const tp = computeThroughputRun(items);

    expect(tp.length).toBe(2); // Jan 2 → Jan 3

    const jan2 = tp.find((r) => r.date === "2024-01-02");
    const jan3 = tp.find((r) => r.date === "2024-01-03");

    expect(jan2.count).toBe(2);
    expect(jan3.count).toBe(1);
  });
});