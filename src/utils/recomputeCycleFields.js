export function recomputeCycleFields(items, inProgressStates, workflowStates) {
  return items.map((item) => {
    const dates = item.workflowDates || {};

    // Find first in-progress state date
    const inProgressDates = workflowStates
      .filter((s) => inProgressStates[s])
      .map((s) => dates[s])
      .filter(Boolean);

    const cycleStart =
      inProgressDates.length > 0
        ? new Date(Math.min(...inProgressDates.map((d) => new Date(d))))
        : new Date(
            Math.min(
              ...Object.values(dates).map((d) => new Date(d))
            )
          );

    const cycleEnd = dates["Done"] || dates["Resolved"] || null;

    return {
      ...item,
      cycleStart,
      cycleEnd
    };
  });
}