import { describe, it, expect } from "vitest";
import { recomputeCycleFields } from "../src/utils/recomputeCycleFields";

function makeItem(entered) {
  return { id: "1", title: "test", entered };
}

describe("recomputeCycleFields", () => {
  const workflowStates = ["Backlog", "In Progress", "Review", "Done"];
  const inProgressStates = { "In Progress": true, Review: true };

  it("derives cycleStart from the first in-progress state", () => {
    const item = makeItem({
      entered_Backlog: new Date("2024-01-01"),
      "entered_In Progress": new Date("2024-01-03"),
      entered_Review: new Date("2024-01-06"),
      entered_Done: new Date("2024-01-10")
    });

    const [result] = recomputeCycleFields([item], inProgressStates, workflowStates);
    expect(result.cycleStart).toBeInstanceOf(Date);
    expect(result.cycleStart.toISOString().slice(0, 10)).toBe("2024-01-03");
  });

  it("derives cycleEnd from the final workflow state", () => {
    const item = makeItem({
      "entered_In Progress": new Date("2024-01-03"),
      entered_Done: new Date("2024-01-10")
    });

    const [result] = recomputeCycleFields([item], inProgressStates, workflowStates);
    expect(result.cycleEnd).toBeInstanceOf(Date);
    expect(result.cycleEnd.toISOString().slice(0, 10)).toBe("2024-01-10");
  });

  it("sets cycleStart to null when no in-progress state is entered", () => {
    const item = makeItem({
      entered_Backlog: new Date("2024-01-01")
    });

    const [result] = recomputeCycleFields([item], inProgressStates, workflowStates);
    expect(result.cycleStart).toBeNull();
  });

  it("sets cycleEnd to null when final state has no entry date", () => {
    const item = makeItem({
      "entered_In Progress": new Date("2024-01-03")
    });

    const [result] = recomputeCycleFields([item], inProgressStates, workflowStates);
    expect(result.cycleEnd).toBeNull();
  });

  it("sets completed to true when cycleEnd is present", () => {
    const item = makeItem({
      "entered_In Progress": new Date("2024-01-03"),
      entered_Done: new Date("2024-01-10")
    });

    const [result] = recomputeCycleFields([item], inProgressStates, workflowStates);
    expect(result.completed).toBe(true);
  });

  it("sets completed to false when cycleEnd is null", () => {
    const item = makeItem({
      "entered_In Progress": new Date("2024-01-03")
    });

    const [result] = recomputeCycleFields([item], inProgressStates, workflowStates);
    expect(result.completed).toBe(false);
  });

  it("flattens entered dates onto the item", () => {
    const enteredDate = new Date("2024-01-03");
    const item = makeItem({
      "entered_In Progress": enteredDate,
      entered_Done: new Date("2024-01-10")
    });

    const [result] = recomputeCycleFields([item], inProgressStates, workflowStates);
    expect(result["entered_In Progress"]).toBe(enteredDate);
  });

  it("normalizes cycleStart and cycleEnd to UTC midnight", () => {
    const item = makeItem({
      "entered_In Progress": new Date("2024-01-03T15:30:00Z"),
      entered_Done: new Date("2024-01-10T22:00:00Z")
    });

    const [result] = recomputeCycleFields([item], inProgressStates, workflowStates);
    expect(result.cycleStart.getUTCHours()).toBe(0);
    expect(result.cycleEnd.getUTCHours()).toBe(0);
  });

  it("processes multiple items independently", () => {
    const items = [
      makeItem({ "entered_In Progress": new Date("2024-01-01"), entered_Done: new Date("2024-01-05") }),
      makeItem({ "entered_In Progress": new Date("2024-01-10"), entered_Done: null })
    ];

    const results = recomputeCycleFields(items, inProgressStates, workflowStates);
    expect(results[0].completed).toBe(true);
    expect(results[1].completed).toBe(false);
  });

  it("returns an empty array when given no items", () => {
    expect(recomputeCycleFields([], inProgressStates, workflowStates)).toEqual([]);
  });
});
