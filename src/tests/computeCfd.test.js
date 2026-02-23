// src/tests/computeCfd.test.js
import { describe, it, expect } from "vitest";
import { computeCfd } from "../utils/metrics";

describe("computeCfd", () => {
  const workflow = ["Refinement", "Development", "Testing", "Done"];

  const items = [
    {
      id: 1,
      started: new Date("2024-01-01"),
      created: new Date("2024-01-01"),
      completed: new Date("2024-01-05"),
      transitions: {
        Refinement: new Date("2024-01-01"),
        Development: new Date("2024-01-02"),
        Testing: new Date("2024-01-03"),
        Done: new Date("2024-01-05")
      }
    },
    {
      id: 2,
      started: new Date("2024-01-02"),
      created: new Date("2024-01-02"),
      completed: new Date("2024-01-04"),
      transitions: {
        Refinement: new Date("2024-01-02"),
        Development: new Date("2024-01-03"),
        Testing: new Date("2024-01-03"),
        Done: new Date("2024-01-04")
      }
    }
  ];

  it("computes CFD rows for each day in range", () => {
    const cfd = computeCfd(items, workflow);

    expect(cfd.length).toBe(5); // Jan 1 → Jan 5
    expect(cfd[0].date).toBe("2024-01-01");
    expect(cfd[4].date).toBe("2024-01-05");
  });

  it("counts items in each state correctly", () => {
    const cfd = computeCfd(items, workflow);

    const jan3 = cfd.find((r) => r.date === "2024-01-03");

    expect(jan3.Refinement).toBe(2);
    expect(jan3.Development).toBe(2);
    expect(jan3.Testing).toBe(2);
    expect(jan3.Done).toBe(0);
  });
});