// src/utils/parseWorkflowCsv.js

import { parseDate } from "./metrics";
import { useAnalyticsStore } from "../store/useAnalyticsStore";

// -------------------------------------------------------
// SAFE DATE PARSER (patch)
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

/** Infer completed date from last non-null workflow state. */
function inferCompleted(entered) {
  const states = Object.keys(entered);
  for (let i = states.length - 1; i >= 0; i--) {
    const s = states[i];
    if (entered[s]) return entered[s];
  }
  return null;
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
  // 4. Get in-progress states from store (persisted)
  // -------------------------------------------------------
  const inProgressStates =
    useAnalyticsStore.getState().inProgressStates || {};

  // -------------------------------------------------------
  // 5. Normalize each row
  // -------------------------------------------------------
  const items = cleaned.map((row, index) => {
    const id = row.id ?? "";
    const title = row.title ?? "";

    const entered = {};

    workflowColumns.forEach((col) => {
      const raw =
        row[col] ?? row[col.replace(/^entered_/, "")] ?? "";
      entered[col] = safeParseDate(raw); // PATCHED
    });

    // earliest non-null workflow date
    const earliest =
      Object.values(entered)
        .filter(Boolean)
        .sort((a, b) => a - b)[0] || null;

    // completed = last non-null workflow state
    const completed = inferCompleted(entered);

    // -------------------------------------------------------
    // Compute cycleStart using hybrid logic:
    // 1. First in-progress-state date
    // 2. Otherwise earliest workflow date
    // -------------------------------------------------------
    const inProgressDates = workflowStates
      .filter((s) => inProgressStates[s]) // only in-progress states
      .map((s) => entered[`entered_${s}`])
      .filter(Boolean)
      .sort((a, b) => a - b);

    const cycleStart = inProgressDates[0] || earliest;

    // cycleEnd = completed
    const cycleEnd = completed;

    return {
      id,
      title,
      created: earliest,
      completed,
      entered,
      cycleStart,
      cycleEnd,
      _rowIndex: index + 2
    };
  });

  return { items, workflowStates, errors };
}