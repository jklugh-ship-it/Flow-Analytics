// src/utils/workflow/normalizeVisibility.js
// Describe what this does

console.log("normalizeVisibility loaded from:", import.meta.url);

export function normalizeVisibility(prevVisibility, workflowStates) {
  const visibility = { ...prevVisibility };

  workflowStates.forEach((s) => {
    if (!(s in visibility)) visibility[s] = true;
  });

  Object.keys(visibility).forEach((s) => {
    if (!workflowStates.includes(s)) delete visibility[s];
  });

  return visibility;
}