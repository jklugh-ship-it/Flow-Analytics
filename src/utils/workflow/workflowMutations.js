// src/utils/workflow/workflowMutations.js
// Describe what this does
export function addWorkflowState(states, name) {
  return [...states, name];
}

export function deleteWorkflowState(states, name) {
  return states.filter((s) => s !== name);
}

export function mergeWorkflowStates(states, namesToMerge, newName) {
  return states.filter((s) => !namesToMerge.includes(s)).concat(newName);
}