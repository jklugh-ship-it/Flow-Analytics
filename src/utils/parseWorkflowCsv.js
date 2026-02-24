// src/utils/parseWorkflowCsv.js

function simpleParseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(",").map((h) => h.trim());

  const data = rows.map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });

  return { headers, data };
}

function normalizeDate(value) {
  if (!value || value.trim() === "") return null;

  // Handle ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    if (y > 2100) return null; // guard against absurd future dates
    return new Date(y, m - 1, d).toISOString().slice(0, 10);
  }

  // Handle MM/DD/YYYY
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getFullYear() > 2100) return null;

  return d.toISOString().slice(0, 10);
}

/**
 * CSV format:
 * id,title,entered_<State1>,entered_<State2>,...,entered_<StateN>
 *
 * created = earliest non-null workflow date
 * completed = final workflow state's date
 *
 * RETURNS:
 * {
 *   items: [...],
 *   workflowStates: [...],   <-- extracted from CSV header
 *   errors: [...]
 * }
 */
export function parseWorkflowCsv(csvText) {
  const errors = [];
  const { headers, data } = simpleParseCsv(csvText);

  // -------------------------------------------------------
  // 1. Remove empty rows (all fields blank)
  // -------------------------------------------------------
  const cleaned = data.filter((row) =>
    Object.values(row).some((v) => v && v.trim() !== "")
  );

  if (cleaned.length === 0) {
    errors.push("CSV contains no usable rows.");
    return { items: [], workflowStates: [], errors };
  }

  // -------------------------------------------------------
  // 2. Extract workflow states from CSV header
  // -------------------------------------------------------
  const workflowStates = headers
    .filter((h) => h.startsWith("entered_"))
    .map((h) => h.replace("entered_", ""));

  if (workflowStates.length === 0) {
    errors.push("No workflow state columns found (expected entered_<StateName>).");
    return { items: [], workflowStates: [], errors };
  }

  // -------------------------------------------------------
  // 3. Validate first two columns
  // -------------------------------------------------------
  if (headers[0] !== "id" || headers[1] !== "title") {
    errors.push(`CSV must begin with: id,title`);
    return { items: [], workflowStates: [], errors };
  }

  // -------------------------------------------------------
  // 4. Normalize each row
  // -------------------------------------------------------
  const items = cleaned.map((row, index) => {
    const id = row.id ?? "";
    const title = row.title ?? "";

    const entered = {};
    workflowStates.forEach((state) => {
      const col = `entered_${state}`;
      entered[state] = normalizeDate(row[col] ?? "");
    });

    // created = earliest non-null workflow date
    const created =
      Object.values(entered)
        .filter(Boolean)
        .sort()[0] || null;

    // completed = final workflow state's date
    const finalState = workflowStates[workflowStates.length - 1];
    const completed = entered[finalState] || null;

    return {
      id,
      title,
      created,
      completed,
      entered,
      _rowIndex: index + 2
    };
  });

  return { items, workflowStates, errors };
}