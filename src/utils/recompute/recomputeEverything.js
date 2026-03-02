// src/utils/recompute/recomputeEverything.js

import { recomputeCycleFields } from "../recomputeCycleFields";
import { computeAllMetrics } from "../metrics/computeAllMetrics";
import { computeSummary } from "../metrics/computeSummary";

export function recomputeEverything(get, set) {
  const { items, workflowStates, inProgressStates } = get();

  // Normalize items (cycleStart, cycleEnd, currentState, etc.)
  const itemsWithCycle = recomputeCycleFields(
    items,
    inProgressStates,
    workflowStates
  );

  // Full metrics orchestrator
  const inProgressArray = Object.keys(inProgressStates).filter(
  (k) => inProgressStates[k]
  );

const { metrics, throughputHistory } = computeAllMetrics(
  itemsWithCycle,
  workflowStates,
  inProgressArray
  );


  // UI summary (avg cycle time, avg throughput, totals)
  const summary = computeSummary(itemsWithCycle, metrics);

  // Commit to store
  set({
    items: itemsWithCycle,
    metrics,
    throughputHistory,
    summary
  });
}