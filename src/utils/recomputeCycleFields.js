// src/utils/recomputeCycleFields.js

function normalizeToUtcDateOnly(dt) {
  if (!dt) return null;
  return new Date(Date.UTC(
    dt.getUTCFullYear(),
    dt.getUTCMonth(),
    dt.getUTCDate()
  ));
}

export function recomputeCycleFields(items, inProgressStates, workflowStates) {
  return items.map((item) => {
    const entered = item.entered || {};

    const finalState = workflowStates[workflowStates.length - 1];
	const rawCycleEnd = entered[`entered_${finalState}`] || null;


    const firstInProgressState = workflowStates.find(
      (s) => inProgressStates && inProgressStates[s]
    );

    let rawCycleStart = null;
    if (firstInProgressState) {
      rawCycleStart = entered[`entered_${firstInProgressState}`] || null;
    }

    const cycleStart = normalizeToUtcDateOnly(rawCycleStart);
    const cycleEnd = normalizeToUtcDateOnly(rawCycleEnd);

    return {
      ...item,
      cycleStart,
      cycleEnd,
      completed: !!cycleEnd
    };
  });
}