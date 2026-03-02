// src/utils/metrics/getCurrentState.js

export function getCurrentState(item, workflowStates) {
  const entered = item.entered || {};
  let lastState = null;

  workflowStates.forEach((state) => {
    const d =
      entered[`entered_${state}`] ??
      entered[state];

    if (d instanceof Date) {
      lastState = state;
    }
  });

  return lastState;
}