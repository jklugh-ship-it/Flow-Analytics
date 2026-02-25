// src/tests/computeCfd.test.js
import { describe, it, expect } from "vitest";
import { computeCfd } from "../utils/metrics";

describe("computeCfd", () => {
  it("counts items in each state correctly using Date objects and dynamic keys", () => {
    // --- Test Fixture (Date objects, matching ingestion pipeline) ---
    const items = [
      {
        id: 1,
        created: new Date(2024, 0, 1),
        completed: new Date(2024, 0, 5),
        entered: {
          entered_Refinement: new Date(2024, 0, 1),
          entered_Development: new Date(2024, 0, 2),
          entered_Testing: new Date(2024, 0, 3),
          entered_Done: new Date(2024, 0, 5)
        }
      },
      {
        id: 2,
        created: new Date(2024, 0, 2),
        completed: new Date(2024, 0, 4),
        entered: {
          entered_Refinement: new Date(2024, 0, 2),
          entered_Development: new Date(2024, 0, 3),
          entered_Testing: new Date(2024, 0, 3),
          entered_Done: new Date(2024, 0, 4)
        }
      }
    ];

    // These are the *display* workflow states (matching store)
    const workflowStates = ["Refinement", "Development", "Testing", "Done"];

    // --- Run CFD ---
    const cfd = computeCfd(items, workflowStates);

    // Pick the row we want to validate
    const jan3 = cfd.find((r) => r.date === "2024-01-03");

    // --- Fully dynamic, self-verifying assertions ---
    workflowStates.forEach((state) => {
      const expected = items.filter((item) => {
        const d =
          item.entered?.[state] ??
          item.entered?.[`entered_${state}`];

        return d instanceof Date && d <= new Date(2024, 0, 3);
      }).length;

      expect(jan3[state]).toBe(expected);
    });
  });
});