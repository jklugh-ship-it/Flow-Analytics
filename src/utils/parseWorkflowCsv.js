// src/utils/parseWorkflowCsv.js

import { parseDate } from "./metrics";

// -------------------------------------------------------
// SAFE DATE PARSER
// Rejects invalid or extreme dates (e.g., 2205, 2052)
// -------------------------------------------------------
function safeParseDate(raw) {
  if (!raw) return null;

  const dt = parseDate(raw);
  if (!dt || isNaN(dt.getTime())) return null;

  const year = dt.getFullYear();

  // Reject dates outside a sane range
  if (year < 1990 || year > 2050) {
    console.warn(`Dropping out-of-range date: ${raw}`);
    return null;
  }

  return dt;
}

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

/**
 * Extract workflow columns from CSV header.
 * Accepts both:
 *   entered_StateName
 *   StateName
 * and normalizes everything to entered_StateName.
 */
function extractWorkflowColumns(headers) {
  return headers
    .filter((h) => h !== "id" && h !== "title")
    .filter((h) => h.startsWith("entered_") || !h.includes("_"))
    .map((h) => (h.startsWith("entered_") ? h : `entered_${h}`));
}

/** Convert entered_StateName → StateName */
function displayName(col) {
  return col.replace(/^entered_/, "");
}

export function parseWorkflowCsv(csvText) {
  const errors = [];
  const { headers, data } = simpleParseCsv(csvText);

  // -------------------------------------------------------
  // 1. Remove empty rows
  // -------------------------------------------------------
  const cleaned = data.filter((row) =>
    Object.values(row).some((v) => v && v.trim() !== "")
  );

  if (cleaned.length === 0) {
    errors.push("CSV contains no usable rows.");
    return { items: [], workflowStates: [], errors };
  }

  // -------------------------------------------------------
  // 2. Validate first two columns
  // -------------------------------------------------------
  if (headers[0] !== "id" || headers[1] !== "title") {
    errors.push(`CSV must begin with: id,title`);
    return { items: [], workflowStates: [], errors };
  }

  // -------------------------------------------------------
  // 3. Extract workflow columns dynamically
  // -------------------------------------------------------
  const workflowColumns = extractWorkflowColumns(headers);

  if (workflowColumns.length === 0) {
    errors.push(
      "No workflow state columns found. Expected columns like entered_<State> or <State>."
    );
    return { items: [], workflowStates: [], errors };
  }

  // Display names for UI
  const workflowStates = workflowColumns.map(displayName);

  // -------------------------------------------------------
  // 4. Normalize each row
  //    (No cycleStart/cycleEnd here; strict semantics live in the store)
// -------------------------------------------------------
  const items = cleaned.map((row, index) => {
    const id = row.id ?? "";
    const title = row.title ?? "";

    const entered = {};

    workflowColumns.forEach((col) => {
      const raw = row[col] ?? row[col.replace(/^entered_/, "")] ?? "";
      entered[col] = safeParseDate(raw);
    });

    // earliest non-null workflow date
    const earliest =
      Object.values(entered)
        .filter(Boolean)
        .sort((a, b) => a - b)[0] || null;

    // completed = last non-null workflow state
    const finalCol = workflowColumns[workflowColumns.length - 1];
	const completed = entered[finalCol] || null;


    return {
      id,
      title,
      created: earliest,
      completed,
      entered,
      _rowIndex: index + 2
    };
  });

  return { items, workflowStates, errors };
}