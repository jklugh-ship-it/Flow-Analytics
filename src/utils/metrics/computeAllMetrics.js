// src/utils/metrics/computeAllMetrics.js

import { computeCfd } from "./computeCfd";
import { computeWipRun } from "./computeWipRun";
import { computeThroughputRun } from "./computeThroughputRun";
import { computeCycleTimeHistogram } from "./computeCycleTimeHistogram";
import { computeCycleTimeScatter } from "./computeCycleTimeScatter";
import { computeAgingWip } from "./computeAgingWip";
import { computeCycleTimePercentiles } from "./computeCycleTimePercentiles";
import { computeStability } from "./computeStability";

/**
 * Orchestrates all metric computations.
 * This is the non‑pure version that matches your original metrics.js behavior.
 */
export function computeAllMetrics(items, workflowStates, inProgressStates) {
  const cfd = computeCfd(items, workflowStates);
  const wipRun = computeWipRun(items);
  const throughputRun = computeThroughputRun(items);
  const cycleHistogram = computeCycleTimeHistogram(items);
  const cycleTimeScatter = computeCycleTimeScatter(items);
  const agingWip = computeAgingWip(items, workflowStates);
  const cycleTimePercentiles = computeCycleTimePercentiles(items);

  const wipItems = items.filter((i) =>
    inProgressStates.includes(i.currentState)
  );

  const wipStateCounts = wipItems.reduce((acc, item) => {
    const s = item.currentState;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const stability = computeStability(
    items,
    inProgressStates,
    new Date()
  );

  const throughputHistory = throughputRun.map((d) => d.count);

  return {
    metrics: {
      cfd,
      wipRun,
      throughputRun,
      cycleHistogram,
      cycleTimeScatter,
      agingWip,
      cycleTimePercentiles,
      wipItems,
      wipStateCounts,
      stability
    },
    throughputHistory
  };
}