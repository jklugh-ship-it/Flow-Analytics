// src/utils/metrics/computeArrivalRate.js

export function computeArrivalRate(items, start, end, firstInProgressState) {
  return items.filter((item) => {
    const d = item[`entered_${firstInProgressState}`];
    return d instanceof Date && d >= start && d <= end;
  }).length;
}
