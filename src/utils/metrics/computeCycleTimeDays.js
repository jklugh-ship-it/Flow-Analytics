// src/utils/metrics/computeCycleTimeDays.js

export function computeCycleTimeDays(item) {
  if (!(item.cycleStart instanceof Date)) return null;
  if (!(item.cycleEnd instanceof Date)) return null;

  const ms = item.cycleEnd.getTime() - item.cycleStart.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1; // inclusive
}