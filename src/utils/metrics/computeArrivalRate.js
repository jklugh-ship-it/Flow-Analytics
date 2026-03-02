// src/utils/metrics/computeArrivalRate.js

export function computeArrivalRate(items, start, end) {
  return items.filter((item) => {
    const d = item.entered_Ready;
    return d instanceof Date && d >= start && d <= end;
  }).length;
}
