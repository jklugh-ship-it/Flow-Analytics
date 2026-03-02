// src/utils/workflow/validateWorkflowStates.js
//Validates that the list is an array, there are no duplicates, no empty strings, all values are strings, that there are at least two states, and warns if there are only two states
export function validateWorkflowStates(states) {
  if (!Array.isArray(states)) {
    throw new Error("workflowStates must be an array.");
  }

  // Remove accidental null/undefined
  const cleaned = states.filter(Boolean);

  // Ensure all are strings
  cleaned.forEach((s) => {
    if (typeof s !== "string") {
      throw new Error("All workflow states must be strings.");
    }
  });

  // No duplicates
  const dupes = cleaned.filter(
    (s, idx) => cleaned.indexOf(s) !== idx
  );
  if (dupes.length > 0) {
    throw new Error(
      `Duplicate workflow states detected: ${dupes.join(", ")}`
    );
  }

  // Must have at least 2 states
  if (cleaned.length < 2) {
    throw new Error(
      "Workflow must contain at least two states (waiting → done)."
    );
  }

  return cleaned;
}