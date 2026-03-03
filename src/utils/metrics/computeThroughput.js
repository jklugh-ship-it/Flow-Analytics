// src/utils/metrics/computeThroughput.js

export function computeThroughput(items, start, end, lastState) {
  return items.filter((item) => {
    const d = item[`entered_${lastState}`];
    return d instanceof Date && d >= start && d <= end;
  }).length;
}
