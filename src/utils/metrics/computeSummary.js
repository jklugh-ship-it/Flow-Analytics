// src/utils/metrics/computeSummary.js

console.log("computeSummary loaded from:", import.meta.url);

export function computeSummary(items, metrics) {
  const completedItems = items.filter((i) => i.completed).length;

  // Weighted average cycle time
  const avgCycleTime =
    metrics.cycleHistogram.length > 0
      ? Math.round(
          metrics.cycleHistogram.reduce(
            (sum, bucket) => sum + bucket.value * bucket.count,
            0
          ) /
            metrics.cycleHistogram.reduce(
              (sum, bucket) => sum + bucket.count,
              0
            )
        )
      : 0;

  // Average throughput per day
  const avgThroughput =
    metrics.throughputRun.length > 0
      ? Math.round(
          metrics.throughputRun.reduce(
            (sum, day) => sum + day.count,
            0
          ) / metrics.throughputRun.length
        )
      : 0;

  return {
    totalItems: items.length,
    completedItems,
    avgCycleTime,
    avgThroughput
  };
}