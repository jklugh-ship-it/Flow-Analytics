import { describe, it, expect } from "vitest";
import { parseWorkflowCsv } from "../src/utils/parseWorkflowCsv";

// Helper to build a minimal valid CSV string
function makeCsv(headers, rows) {
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

describe("parseWorkflowCsv", () => {
  describe("structural validation", () => {
    it("returns an error when CSV has no usable rows", () => {
      const csv = "id,title,entered_Ready\n,,";
      const { items, errors } = parseWorkflowCsv(csv);
      expect(errors.length).toBeGreaterThan(0);
      expect(items).toEqual([]);
    });

    it("returns an error when first column is not 'id'", () => {
      const csv = makeCsv(["name", "title", "entered_Ready"], [["1", "thing", "2024-01-01"]]);
      const { errors } = parseWorkflowCsv(csv);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("returns an error when second column is not 'title'", () => {
      const csv = makeCsv(["id", "desc", "entered_Ready"], [["1", "thing", "2024-01-01"]]);
      const { errors } = parseWorkflowCsv(csv);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("returns an error when no workflow state columns are found", () => {
      const csv = makeCsv(["id", "title"], [["1", "thing"]]);
      const { errors } = parseWorkflowCsv(csv);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("column normalization", () => {
    it("accepts entered_StateName column format", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready", "entered_Done"],
        [["1", "thing", "2024-01-01", "2024-01-05"]]
      );
      const { items, workflowStates, errors } = parseWorkflowCsv(csv);
      expect(errors).toEqual([]);
      expect(workflowStates).toEqual(["Ready", "Done"]);
      expect(items[0].entered["entered_Ready"]).toBeInstanceOf(Date);
    });

    it("accepts plain StateName column format", () => {
      const csv = makeCsv(
        ["id", "title", "Ready", "Done"],
        [["1", "thing", "2024-01-01", "2024-01-05"]]
      );
      const { items, workflowStates, errors } = parseWorkflowCsv(csv);
      expect(errors).toEqual([]);
      expect(workflowStates).toEqual(["Ready", "Done"]);
      expect(items[0].entered["entered_Ready"]).toBeInstanceOf(Date);
    });

    it("detects workflow states from column headers", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Backlog", "entered_In Progress", "entered_Done"],
        [["1", "thing", "2024-01-01", "2024-01-02", "2024-01-05"]]
      );
      const { workflowStates } = parseWorkflowCsv(csv);
      expect(workflowStates).toEqual(["Backlog", "In Progress", "Done"]);
    });
  });

  describe("date parsing", () => {
    it("parses valid ISO dates into Date objects", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready"],
        [["1", "thing", "2024-03-15"]]
      );
      const { items } = parseWorkflowCsv(csv);
      expect(items[0].entered["entered_Ready"]).toBeInstanceOf(Date);
      expect(items[0].entered["entered_Ready"].toISOString().slice(0, 10)).toBe("2024-03-15");
    });

    it("leaves null for empty date cells", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready", "entered_Done"],
        [["1", "thing", "2024-01-01", ""]]
      );
      const { items } = parseWorkflowCsv(csv);
      expect(items[0].entered["entered_Done"]).toBeNull();
    });

    it("rejects dates outside the 1990-2050 range", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready"],
        [["1", "thing", "1985-01-01"]]
      );
      const { items } = parseWorkflowCsv(csv);
      expect(items[0].entered["entered_Ready"]).toBeNull();
    });

    it("rejects invalid date strings", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready"],
        [["1", "thing", "not-a-date"]]
      );
      const { items } = parseWorkflowCsv(csv);
      expect(items[0].entered["entered_Ready"]).toBeNull();
    });
  });

  describe("item normalization", () => {
    it("sets created to the earliest non-null entered date", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready", "entered_Done"],
        [["1", "thing", "2024-01-05", "2024-01-10"]]
      );
      const { items } = parseWorkflowCsv(csv);
      expect(items[0].created.toISOString().slice(0, 10)).toBe("2024-01-05");
    });

    it("sets completed to the last workflow state entry date", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready", "entered_Done"],
        [["1", "thing", "2024-01-01", "2024-01-10"]]
      );
      const { items } = parseWorkflowCsv(csv);
      expect(items[0].completed.toISOString().slice(0, 10)).toBe("2024-01-10");
    });

    it("sets completed to null when final state is empty", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready", "entered_Done"],
        [["1", "thing", "2024-01-01", ""]]
      );
      const { items } = parseWorkflowCsv(csv);
      expect(items[0].completed).toBeNull();
    });

    it("skips entirely empty rows", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready"],
        [
          ["1", "thing", "2024-01-01"],
          ["", "", ""],
          ["2", "other", "2024-01-02"]
        ]
      );
      const { items } = parseWorkflowCsv(csv);
      expect(items.length).toBe(2);
    });

    it("preserves id and title from each row", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready"],
        [["ABC-123", "Fix the bug", "2024-01-01"]]
      );
      const { items } = parseWorkflowCsv(csv);
      expect(items[0].id).toBe("ABC-123");
      expect(items[0].title).toBe("Fix the bug");
    });
  });

  describe("multiple items", () => {
    it("parses multiple rows correctly", () => {
      const csv = makeCsv(
        ["id", "title", "entered_Ready", "entered_Done"],
        [
          ["1", "Alpha", "2024-01-01", "2024-01-05"],
          ["2", "Beta", "2024-01-03", ""],
          ["3", "Gamma", "2024-01-04", "2024-01-08"]
        ]
      );
      const { items, errors } = parseWorkflowCsv(csv);
      expect(errors).toEqual([]);
      expect(items.length).toBe(3);
      expect(items[1].completed).toBeNull();
    });
  });
});
