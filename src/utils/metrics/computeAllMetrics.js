// src/utils/metrics/computeAllMetrics.js

import { computeCfd } from "./computeCfd";
import { computeWipRun } from "./computeWipRun";
import { computeThroughputRun } from "./computeThroughputRun";
import { computeCycleTimeHistogram } from "./computeCycleTimeHistogram";
import { computeCycleTimeScatter } from "./computeCycleTimeScatter";
import { computeAgingWip } from "./computeAgingWip";
import { computeCycleTimePercentiles } from "./computeCycleTimePercentiles";
import { computeStability } from "./computeStability";
import { getCurrentState } from "./getCurrentState";

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

  // --- FIXED WIP SELECTOR ---
  const wipItems = items.filter((item) => {
    // Must not be completed
    if (item.cycleEnd !== null) return false;

    // Must have entered at least one in-progress state
    return inProgressStates.some(
      (state) => item[`entered_${state}`] instanceof Date
    );
  });

  // Ordered WIP state counts
  const wipStateCounts = {};
  for (const state of workflowStates) {
    wipStateCounts[state] = 0;
  }

  for (const item of wipItems) {
    const state = getCurrentState(item, workflowStates);
    if (state) {
      wipStateCounts[state] += 1;
    }
  }

  const stability = computeStability(
    items,
    inProgressStates,
    new Date(),
    workflowStates
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
