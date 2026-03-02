// sr/cutils/workflow/computeDefaultInProgress.js
// Default in-progress pattern based on workflow position
export function computeDefaultInProgress(states) {
  const result = {};
  if (!states || states.length === 0) return result;

  states.forEach((s, idx) => {
    if (idx === 0 || idx === states.length - 1) {
      result[s] = false; // waiting/done
    } else {
      result[s] = true; // working
    }
  });

  return result;
}