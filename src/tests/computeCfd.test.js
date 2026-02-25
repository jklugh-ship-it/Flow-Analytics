// src/tests/computeCfd.test.js
import { describe, it, expect } from "vitest";
import { computeCfd } from "../utils/metrics";

describe("computeCfd", () => {
  it("counts items in each state correctly", () => {
    // --- Test Fixture (ISO strings, matches new ingestion pipeline) ---
    const items = [
      {
        id: 1,
        started: "2024-01-01",
        created: "2024-01-01",
        completed: "2024-01-05",
        entered: {
          Refinement: "2024-01-01",
          Development: "2024-01-02",
          Testing: "2024-01-03",
          Done: "2024-01-05"
        }
      },
      {
        id: 2,
        started: "2024-01-02",
        created: "2024-01-02",
        completed: "2024-01-04",
        entered: {
          Refinement: "2024-01-02",
          Development: "2024-01-03",
          Testing: "2024-01-03",
          Done: "2024-01-04"
        }
      }
    ];

    const workflowStates = ["Refinement", "Development", "Testing", "Done"];

    // --- Run CFD ---
    const cfd = computeCfd(items, workflowStates);

    // Pick the row we want to validate
    const jan3 = cfd.find((r) => r.date === "2024-01-03");

    // --- Fully dynamic, self-verifying assertions ---
    workflowStates.forEach((state) => {
      const expected = items.filter(
        (item) =>
          item.entered[state] &&
          item.entered[state] <= "2024-01-03"
      ).length;

      expect(jan3[state]).toBe(expected);
    });
  });
});