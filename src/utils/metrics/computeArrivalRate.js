// src/utils/metrics/computeArrivalRate.js

// Returns items per day over the window
export function computeArrivalRate(items, start, end, firstInProgressState) {
  const count = items.filter((item) => {
    const d = item[`entered_${firstInProgressState}`];
    return d instanceof Date && d >= start && d <= end;
  }).length;

  const days = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
  return Math.round((count / days) * 100) / 100;
}
