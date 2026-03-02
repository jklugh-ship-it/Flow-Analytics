// src/utils/metrics/computeCycleTimeHistogram.js

import { daysBetween } from "../date/daysBetween";

export function computeCycleTimeHistogram(items) {
  if (!items || items.length === 0) return [];

  const buckets = {};

  items.forEach((i) => {
    const start = i.cycleStart;
    const end = i.cycleEnd;

    if (!start || !end) return;

    const ct = daysBetween(start, end);

    // eliminate 0‑day cycle times
    const safeCt = Math.max(ct, 1);

    buckets[safeCt] = (buckets[safeCt] || 0) + 1;
  });

  return Object.entries(buckets).map(([value, count]) => ({
    value: Number(value),
    count
  }));
}