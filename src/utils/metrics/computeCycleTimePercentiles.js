// src/utils/metrics/computeCycleTimePercentiles.js

import { computeCycleTimeDays } from "./computeCycleTimeDays";


/**
 * Percentile calculation (NumPy/R Type‑7 — the statistical standard)
 *
 * This implementation uses the percentile definition common in forecasting,
 * Monte Carlo simulation, and statistical computing libraries such as NumPy,
 * SciPy, R (Type‑7), and Pandas.
 *
 *   idx = p/100 * (n - 1)
 *
 * where:
 *   - p is the percentile (0–100)
 *   - n is the number of observations
 *   - idx is the fractional index into the sorted array
 *
 * If idx is not an integer, we linearly interpolate between the two nearest
 * values. This produces smooth percentile curves and avoids the step‑function
 * behavior of Excel’s PERCENTILE.INC.
 *
 * Why this definition?
 * --------------------
 * • It matches the empirical distribution produced by Monte Carlo forecasting.
 * • It is the de‑facto standard in statistical computing.
 * • It behaves well with small sample sizes (common in workflow analytics).
 * • It avoids Excel’s legacy bias toward extreme values.
 * • It ensures percentile estimates are stable, continuous, and reproducible.
 *
 * Important difference from Excel:
 * --------------------------------
 * Excel’s PERCENTILE.INC uses a different indexing scheme and will often
 * return a higher percentile value for the same dataset. For example:
 *
 *   Data: [1, 2, 3, 4, 5]
 *   p95 (Type‑7): 4.8 → rounds to 5
 *   p85 (Type‑7): 4.4 → rounds to 4
 *
 *   Excel p85 would return 5 instead of 4.
 *
 * Our tests and forecasting logic intentionally follow the Type‑7 definition.
 */

// Linear interpolation percentile
function percentile(sorted, p) {
  if (!sorted || sorted.length === 0) return null;

  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);

  if (lower === upper) return sorted[lower];

  const w = idx - lower;
  return Math.round(sorted[lower] * (1 - w) + sorted[upper] * w);
}

export function computeCycleTimePercentiles(items) {
  if (!items || items.length === 0) {
    return { p50: null, p70: null, p85: null, p95: null };
  }

// Compute inclusive cycle times (1-based) and sort them for percentile math.
// Dates are normalized to UTC midnight in parseDate(), so cycle times are stable.
  const values = items
    .map((item) => computeCycleTimeDays(item))
    .filter((v) => typeof v === "number" && !Number.isNaN(v))
    .sort((a, b) => a - b);
	
  if (values.length === 0) {
    return { p50: null, p70: null, p85: null, p95: null };
  }

  return {
    p50: percentile(values, 50),
    p70: percentile(values, 70),
    p85: percentile(values, 85),
    p95: percentile(values, 95)
  };
}