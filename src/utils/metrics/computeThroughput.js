// src/utils/metrics/computeThroughput.js

export function computeThroughput(items, start, end) {
  return items.filter((item) => {
    const d = item.entered_Resolved;
    return d instanceof Date && d >= start && d <= end;
  }).length;
}
