import { describe, it, expect } from "vitest";
import {
  addWorkflowState,
  deleteWorkflowState,
  mergeWorkflowStates
} from "../src/utils/workflow/workflowMutations";

describe("workflowMutations", () => {
  it("adds a workflow state at the end", () => {
    expect(addWorkflowState(["A", "B"], "C")).toEqual(["A", "B", "C"]);
  });

  it("deletes a workflow state", () => {
    expect(deleteWorkflowState(["A", "B", "C"], "B")).toEqual(["A", "C"]);
  });

  it("merges two states into one", () => {
    expect(mergeWorkflowStates(["A", "B", "C"], "B", "BC"))
  .toEqual(["A", "C", "BC"]);

  });
});