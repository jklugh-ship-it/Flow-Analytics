import { describe, it, expect } from "vitest";
import { computeCfd } from "../src/utils/metrics/computeCfd";
import { parseDate } from "../src/utils/date/parseDate";
import { formatDate } from "../src/utils/metrics/formatDate";

describe("computeCfd", () => {
  it("returns an empty array when no items are provided", () => {
    expect(computeCfd([])).toEqual([]);
    expect(computeCfd(null)).toEqual([]);
  });

  it("counts items in each state correctly on a given day", () => {
    const items = [
      {
        id: 1,
        cycleStart: "2024-01-01",
        cycleEnd: "2024-01-05",
        entered: {
          Refinement: "2024-01-01",
          Development: "2024-01-02",
          Testing: "2024-01-03",
          Done: "2024-01-05"
        }
      },
      {
        id: 2,
        cycleStart: "2024-01-02",
        cycleEnd: "2024-01-04",
        entered: {
          Refinement: "2024-01-02",
          Development: "2024-01-03",
          Testing: "2024-01-03",
          Done: "2024-01-04"
        }
      }
    ];

    const workflowStates = ["Refinement", "Development", "Testing", "Done"];

    const cfd = computeCfd(items, workflowStates);

    const targetDate = "2024-01-03";
    const row = cfd.find((r) => r.date === targetDate);

    workflowStates.forEach((state) => {
      const expected = items.filter((i) => {
        const entered = parseDate(i.entered[state]);
        const day = parseDate(targetDate);
        return entered && entered <= day;
      }).length;

      expect(row[state]).toBe(expected);
    });
  });

  it("ignores items with missing or invalid entered dates", () => {
    const items = [
      {
        id: 1,
        cycleStart: "2024-01-01",
        cycleEnd: "2024-01-05",
        entered: {
          Refinement: "2024-01-01",
          Development: "2024-01-02",
          Testing: "2024-01-03",
          Done: "2024-01-05"
        }
      },
      {
        id: 2,
        cycleStart: "2024-01-02",
        cycleEnd: "2024-01-04",
        entered: {
          Refinement: "not-a-date",
          Development: "2024-01-03",
          Testing: "2024-01-03",
          Done: "2024-01-04"
        }
      }
    ];

    const workflowStates = ["Refinement", "Development", "Testing", "Done"];
    const cfd = computeCfd(items, workflowStates);

    const row = cfd.find((r) => r.date === "2024-01-03");

    expect(row.Refinement).toBe(1);
    expect(row.Development).toBe(2);
    expect(row.Testing).toBe(2);
    expect(row.Done).toBe(0);
  });

  it("produces a continuous timeline from earliest entry to latest completion", () => {
    const items = [
      {
        id: 1,
        cycleStart: "2024-01-01",
        cycleEnd: "2024-01-05",
        entered: {
          Refinement: "2024-01-01",
          Development: "2024-01-02",
          Testing: "2024-01-03",
          Done: "2024-01-05"
        }
      }
    ];

    const workflowStates = ["Refinement", "Development", "Testing", "Done"];
    const cfd = computeCfd(items, workflowStates);

    const first = parseDate("2024-01-01");
    const last = parseDate("2024-01-05");

    const expectedDates = [];
    let cursor = new Date(first);
    while (cursor <= last) {
      expectedDates.push(formatDate(cursor));
      cursor = new Date(Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() + 1
      ));
    }

    expect(cfd.map((r) => r.date)).toEqual(expectedDates);
  });
});

it("normalizes entered keys using all fallback patterns", () => {
  const items = [
    {
      id: 1,
      cycleStart: "2024-01-01",
      cycleEnd: "2024-01-05",
      entered: {
        entered_Ready: "2024-01-01",          // legacy
        In_Development: "2024-01-02",         // underscores
        InTesting: "2024-01-03",              // no spaces
        "Ready for Acceptance": "2024-01-04"  // exact match
      }
    }
  ];

  const workflowStates = [
    "Ready",
    "In Development",
    "In Testing",
    "Ready for Acceptance"
  ];

  const cfd = computeCfd(items, workflowStates);

  const row = cfd.find((r) => r.date === "2024-01-04");

  expect(row.Ready).toBe(1);
  expect(row["In Development"]).toBe(1);
  expect(row["In Testing"]).toBe(1);
  expect(row["Ready for Acceptance"]).toBe(1);
});

it("ignores missing or invalid entered dates during counting", () => {
  const items = [
    {
      id: 1,
      cycleStart: "2024-01-01",
      cycleEnd: "2024-01-03",
      entered: {
        Ready: "2024-01-01",
        "In Development": "not-a-date", // invalid
        "In Testing": null              // missing
      }
    }
  ];

  const workflowStates = ["Ready", "In Development", "In Testing"];

  const cfd = computeCfd(items, workflowStates);

  const row = cfd.find((r) => r.date === "2024-01-02");

  expect(row.Ready).toBe(1);
  expect(row["In Development"]).toBe(0);
  expect(row["In Testing"]).toBe(0);
});

it("uses the earliest entered date and latest cycleEnd to define the timeline", () => {
  const items = [
    {
      id: 1,
      cycleStart: "2024-01-10",
      cycleEnd: "2024-01-20",
      entered: { Ready: "2024-01-10" }
    },
    {
      id: 2,
      cycleStart: "2024-01-01",
      cycleEnd: "2024-01-25",
      entered: { Ready: "2024-01-01" }
    }
  ];

  const cfd = computeCfd(items, ["Ready"]);

  expect(cfd[0].date).toBe("2024-01-01");   // earliest entered
  expect(cfd[cfd.length - 1].date).toBe("2024-01-25"); // latest cycleEnd
});

it("handles workflow states that only appear in some items", () => {
  const items = [
    {
      id: 1,
      cycleStart: "2024-01-01",
      cycleEnd: "2024-01-03",
      entered: { Ready: "2024-01-01" }
    },
    {
      id: 2,
      cycleStart: "2024-01-02",
      cycleEnd: "2024-01-04",
      entered: { "In Development": "2024-01-02" }
    }
  ];

  const workflowStates = ["Ready", "In Development"];

  const cfd = computeCfd(items, workflowStates);

  const row = cfd.find((r) => r.date === "2024-01-03");

  expect(row.Ready).toBe(1);
  expect(row["In Development"]).toBe(1);
});

it("returns [] when items exist but no valid dates are found", () => {
  const items = [
    {
      id: 1,
      cycleStart: "not-a-date",
      cycleEnd: "also-bad",
      entered: { Ready: "still-bad" }
    }
  ];

  const cfd = computeCfd(items, ["Ready"]);
  expect(cfd).toEqual([]);
});

it("handles workflow states that do not match any entered key", () => {
  const items = [
    {
      id: 1,
      cycleStart: "2024-01-01",
      cycleEnd: "2024-01-02",
      entered: {
        Ready: "2024-01-01"
        // No key that matches "CompletelyDifferentState"
      }
    }
  ];

  const cfd = computeCfd(items, ["CompletelyDifferentState"]);

  // Should produce a timeline but with 0 for that state
  expect(cfd[0]["CompletelyDifferentState"]).toBe(0);
  expect(cfd[1]["CompletelyDifferentState"]).toBe(0);
});