// src/utils/metrics/computeAgingWip.js

import { getCurrentState } from "./getCurrentState";

export function computeAgingWip(items, workflowStates) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const points = [];

  items.forEach((item) => {
    // Must have started
    if (!(item.cycleStart instanceof Date)) return;

    // Must NOT be completed
    if (item.cycleEnd instanceof Date) return;

    const currentState = getCurrentState(item, workflowStates);
    if (!currentState) return;

    const ageMs = today.getTime() - item.cycleStart.getTime();
    const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000)) + 1;

    points.push({
      id: item.id,
      state: currentState,
      ageDays
    });
  });

  return points;
}