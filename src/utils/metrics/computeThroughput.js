// src/utils/metrics/computeThroughput.js

// Returns items per day over the window
export function computeThroughput(items, start, end, lastState) {
  const count = items.filter((item) => {
    const d = item[`entered_${lastState}`];
    return d instanceof Date && d >= start && d <= end;
  }).length;

  const days = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
  return Math.round((count / days) * 100) / 100;
}
