// src/utils/metrics/computeCycleTimePercentiles.js

import { computeCycleTimeDays } from "./computeCycleTimeDays";

function percentile(sorted, p) {
  if (sorted.length === 0) return null;

  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);

  if (lower === upper) return sorted[lower];

  const w = idx - lower;
  return Math.round(sorted[lower] * (1 - w) + sorted[upper] * w);
}

export function computeCycleTimePercentiles(items) {
  const values = items
    .map(computeCycleTimeDays)
    .filter((v) => typeof v === "number")
    .sort((a, b) => a - b);

  return {
    p50: percentile(values, 50),
    p70: percentile(values, 70),
    p85: percentile(values, 85),
    p95: percentile(values, 95)
  };
}