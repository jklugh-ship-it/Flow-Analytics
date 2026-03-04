import { describe, it, expect } from "vitest";
import { computeHistoricalWipAge } from "../src/utils/metrics/computeHistoricalWipAge";

// -------------------------------------------------------
// Helper
// -------------------------------------------------------

function utc(str) {
  return new Date(`${str}T00:00:00.000Z`);
}

const inProgressStates = ["In Progress", "Review"];
const windowEnd = utc("2024-01-15");

// -------------------------------------------------------
// Tests
// -------------------------------------------------------

describe("computeHistoricalWipAge", () => {
  it("returns 0 when given no items", () => {
    expect(computeHistoricalWipAge([], inProgressStates, windowEnd)).toBe(0);
  });

  it("returns 0 when no items were WIP on the window date", () => {
    // Item started after windowEnd
    const items = [
      {
        "entered_In Progress": utc("2024-01-20"),
        cycleEnd: null
      }
    ];
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(0);
  });

  it("excludes items that completed before or on the window date", () => {
    const items = [
      {
        "entered_In Progress": utc("2024-01-01"),
        cycleEnd: utc("2024-01-10") // completed before windowEnd
      },
      {
        "entered_In Progress": utc("2024-01-01"),
        cycleEnd: utc("2024-01-15") // completed exactly on windowEnd — also excluded
      }
    ];
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(0);
  });

  it("includes items that completed after the window date", () => {
    const items = [
      {
        "entered_In Progress": utc("2024-01-10"),
        cycleEnd: utc("2024-01-20") // completed after windowEnd — still WIP on windowEnd
      }
    ];
    // Age = floor((Jan 15 - Jan 10) / oneDay) + 1 = 6
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(6);
  });

  it("includes items still in progress (no cycleEnd)", () => {
    const items = [
      {
        "entered_In Progress": utc("2024-01-05"),
        cycleEnd: null
      }
    ];
    // Age = floor((Jan 15 - Jan 5) / oneDay) + 1 = 11
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(11);
  });

  it("uses the earliest in-progress entry date across multiple in-progress states", () => {
    const items = [
      {
        "entered_In Progress": utc("2024-01-10"),
        entered_Review: utc("2024-01-05"), // earlier — should be used
        cycleEnd: null
      }
    ];
    // Age = floor((Jan 15 - Jan 5) / oneDay) + 1 = 11
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(11);
  });

  it("excludes items with no in-progress state entries", () => {
    const items = [
      {
        entered_Backlog: utc("2024-01-01"),
        cycleEnd: null
        // No entered_In Progress or entered_Review
      }
    ];
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(0);
  });

  it("returns the average age across multiple active items", () => {
    const items = [
      {
        "entered_In Progress": utc("2024-01-05"), // age = 11
        cycleEnd: null
      },
      {
        "entered_In Progress": utc("2024-01-10"), // age = 6
        cycleEnd: null
      }
    ];
    // Average = (11 + 6) / 2 = 8.5 → rounds to 9
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(9);
  });

  it("rounds the average to the nearest integer", () => {
    const items = [
      {
        "entered_In Progress": utc("2024-01-12"), // age = 4
        cycleEnd: null
      },
      {
        "entered_In Progress": utc("2024-01-13"), // age = 3
        cycleEnd: null
      },
      {
        "entered_In Progress": utc("2024-01-14"), // age = 2
        cycleEnd: null
      }
    ];
    // Average = (4 + 3 + 2) / 3 = 3 exactly
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(3);
  });

  it("returns 1 for an item that entered in-progress exactly on the window date", () => {
    const items = [
      {
        "entered_In Progress": utc("2024-01-15"), // same as windowEnd
        cycleEnd: null
      }
    ];
    // Age = floor((Jan 15 - Jan 15) / oneDay) + 1 = 1
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(1);
  });

  it("handles a mix of WIP and non-WIP items correctly", () => {
    const items = [
      {
        "entered_In Progress": utc("2024-01-05"), // age = 11, active
        cycleEnd: null
      },
      {
        "entered_In Progress": utc("2024-01-01"), // completed before windowEnd
        cycleEnd: utc("2024-01-10")
      },
      {
        "entered_In Progress": utc("2024-01-20"), // started after windowEnd
        cycleEnd: null
      }
    ];
    // Only first item qualifies: age = 11
    expect(computeHistoricalWipAge(items, inProgressStates, windowEnd)).toBe(11);
  });

  it("works correctly with a single in-progress state", () => {
    const items = [
      {
        "entered_In Progress": utc("2024-01-08"),
        cycleEnd: null
      }
    ];
    // Age = floor((Jan 15 - Jan 8) / oneDay) + 1 = 8
    expect(computeHistoricalWipAge(["In Progress"], inProgressStates, windowEnd)).toBe(0);
    expect(computeHistoricalWipAge(items, ["In Progress"], windowEnd)).toBe(8);
  });
});
