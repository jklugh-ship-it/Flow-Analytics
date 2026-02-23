// src/tests/computeWipRun.test.js
import { describe, it, expect } from "vitest";
import { computeWipRun } from "../utils/metrics";

describe("computeWipRun", () => {
  const items = [
    {
      id: 1,
      started: new Date("2024-01-01"),
      completed: new Date("2024-01-03")
    },
    {
      id: 2,
      started: new Date("2024-01-02"),
      completed: null
    }
  ];

  it("computes WIP counts per day", () => {
    const wip = computeWipRun(items);

    expect(wip.length).toBe(3); // Jan 1 → Jan 3

    const jan1 = wip.find((r) => r.date === "2024-01-01");
    const jan2 = wip.find((r) => r.date === "2024-01-02");
    const jan3 = wip.find((r) => r.date === "2024-01-03");

    expect(jan1.count).toBe(1);
    expect(jan2.count).toBe(2);
    expect(jan3.count).toBe(1); // item 1 completes on Jan 3
  });
});