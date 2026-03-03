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

  // --- FIXED WIP SELECTOR ---
  const wipItems = items.filter((item) => {
    // Must not be completed
    if (item.cycleEnd !== null) return false;

    // Must have entered at least one in-progress state
    return inProgressStates.some(
      (state) => item[`entered_${state}`] instanceof Date
    );
  });

  // Derive current state from latest entered_<state> timestamp
  function getCurrentState(item, workflowStates) {
  let latestState = null;
  let latestDate = null;

  for (const state of workflowStates) {
    const d = item[`entered_${state}`];
    if (d instanceof Date) {
      if (!latestDate || d > latestDate) {
        latestDate = d;
        latestState = state;
      }
    }
  }

  return latestState;
  }

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