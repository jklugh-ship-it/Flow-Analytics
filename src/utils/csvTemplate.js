// src/utils/csvTemplate.js

export function generateCsvTemplate(workflowStates) {
  const baseColumns = ["id", "title", "created_date", "completed_date"];

  const transitionColumns = workflowStates.map(
    (s) => `entered_${s}`
  );

  const header = [...baseColumns, ...transitionColumns].join(",");

  // Provide one empty example row for clarity
  const exampleRow = [...baseColumns, ...transitionColumns]
    .map(() => "")
    .join(",");

  return header + "\n" + exampleRow + "\n";
}