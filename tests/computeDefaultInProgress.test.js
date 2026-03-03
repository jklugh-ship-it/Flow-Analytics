import { describe, it, expect } from "vitest";
import { computeDefaultInProgress } from "../src/utils/workflow/computeDefaultInProgress";

describe("computeDefaultInProgress", () => {
  it("marks only middle states as in-progress", () => {
    const states = ["Backlog", "Doing", "Review", "Done"];

    expect(computeDefaultInProgress(states)).toEqual({
      Backlog: false,
      Doing: true,
      Review: true,
      Done: false
    });
  });

  it("handles a single-state workflow", () => {
    expect(computeDefaultInProgress(["Only"])).toEqual({ Only: false });
  });

  it("handles two-state workflow", () => {
    expect(computeDefaultInProgress(["Start", "End"])).toEqual({
      Start: false,
      End: false
    });
  });
});