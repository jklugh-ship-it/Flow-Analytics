export function getCurrentState(item, workflowStates) {
  const entered = item.entered || {};
  let lastState = null;
  let lastDate = null;

  workflowStates.forEach((state) => {
    const d =
      entered[`entered_${state}`] ??
      entered[state];

    if (d instanceof Date && (lastDate === null || d >= lastDate)) {
	lastState = state;
	lastDate = d;
}
  });

  return lastState;
}