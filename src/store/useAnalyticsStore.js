// src/store/useAnalyticsStore.js

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  computeCfd,
  computeWipRun,
  computeThroughputRun,
  computeCycleTimeHistogram,
  computeCycleTimeScatter,
  computeAgingWip,
  computeCycleTimePercentiles
} from "../utils/metrics";
import { recomputeCycleFields } from "../utils/recomputeCycleFields";


// -------------------------------------------------------
// Default in-progress pattern based on workflow position
// -------------------------------------------------------
function computeDefaultInProgress(states) {
  const result = {};
  if (states.length === 0) return result;

  states.forEach((s, idx) => {
    if (idx === 0 || idx === states.length - 1) {
      result[s] = false; // first + last = waiting/done
    } else {
      result[s] = true; // middle states = working
    }
  });

  return result;
}

// -------------------------------------------------------
// Compute metrics from items (pure functions)
// -------------------------------------------------------
function computeAllMetricsPure(items, workflowStates) {
  const cfd = computeCfd(items, workflowStates);
  const wipRun = computeWipRun(items);
  const throughputRun = computeThroughputRun(items);
  const cycleHistogram = computeCycleTimeHistogram(items);
  const cycleTimeScatter = computeCycleTimeScatter(items);
  const agingWip = computeAgingWip(items, workflowStates);
  const cycleTimePercentiles = computeCycleTimePercentiles(items);

  const throughputHistory = throughputRun.map((d) => d.count);

  return {
    metrics: {
      cfd,
      wipRun,
      throughputRun,
      cycleHistogram,
      cycleTimeScatter,
      agingWip,
      cycleTimePercentiles
    },
    throughputHistory
  };
}


// -------------------------------------------------------
// Compute summary from items (pure functions)
// -------------------------------------------------------
function computeSummaryPure(items, metrics) {
  const completed = items.filter((i) => i.completed).length;

  const avgCycle =
    metrics.cycleHistogram.length > 0
      ? Math.round(
          metrics.cycleHistogram.reduce(
            (sum, d) => sum + d.value * d.count,
            0
          ) /
            metrics.cycleHistogram.reduce(
              (sum, d) => sum + d.count,
              0
            )
        )
      : 0;

  const avgThroughput =
    metrics.throughputRun.length > 0
      ? Math.round(
          metrics.throughputRun.reduce(
            (sum, d) => sum + d.count,
            0
          ) / metrics.throughputRun.length
        )
      : 0;

  return {
    totalItems: items.length,
    completedItems: completed,
    avgCycleTime: avgCycle,
    avgThroughput
  };
}

export const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      // -------------------------------------------------------
      // WORKFLOW STATE (CSV is authoritative)
      // -------------------------------------------------------
      workflowStates: [],

      workflowVisibility: {},

      // User has explicitly customized in-progress states at least once
      hasUserCustomizedInProgress: false,

      setWorkflowStates: (states) => {
        const prev = get();

        // Visibility normalization
        const visibility = { ...prev.workflowVisibility };
        states.forEach((s) => {
          if (!(s in visibility)) visibility[s] = true;
        });
        Object.keys(visibility).forEach((s) => {
          if (!states.includes(s)) delete visibility[s];
        });

        // Default in-progress pattern
        const inProgress = computeDefaultInProgress(states);

        // Alert for 2-state workflow (no working states)
        const anyInProgress = Object.values(inProgress).some(Boolean);
        if (!anyInProgress && states.length === 2) {
          alert(
            "Your workflow has only two states. By default, the first and last " +
              "states are treated as 'waiting' and 'done', so neither is marked " +
              "as a working state. To calculate cycle time, mark at least one " +
              "state as 'In Progress'."
          );
        }

        // Atomic recomputation
        set((s) => {
          const itemsWithCycle = recomputeCycleFields(
            s.items,
            inProgress,
            states
          );

          const { metrics, throughputHistory } = computeAllMetricsPure(
            itemsWithCycle,
            states
          );
          const summary = computeSummaryPure(itemsWithCycle, metrics);

          return {
            workflowStates: states,
            workflowVisibility: visibility,
            inProgressStates: inProgress,
            hasUserCustomizedInProgress: s.hasUserCustomizedInProgress,
            items: itemsWithCycle,
            metrics,
            throughputHistory,
            summary
          };
        });
      },

      toggleWorkflowVisibility: (stateName) =>
        set((prev) => ({
          workflowVisibility: {
            ...prev.workflowVisibility,
            [stateName]: !prev.workflowVisibility[stateName]
          }
        })),

      addWorkflowState: (name) => {
        const { workflowStates, setWorkflowStates } = get();
        setWorkflowStates([...workflowStates, name]);
      },

      deleteWorkflowState: (name) => {
        const { workflowStates, setWorkflowStates } = get();
        const updated = workflowStates.filter((s) => s !== name);
        setWorkflowStates(updated);
      },

      mergeWorkflowStates: (names, newName) => {
        const { workflowStates, setWorkflowStates } = get();
        const updated = workflowStates
          .filter((s) => !names.includes(s))
          .concat(newName);
        setWorkflowStates(updated);
      },

      // -------------------------------------------------------
      // IN-PROGRESS WORKFLOW STATES (user-defined, persisted)
      // -------------------------------------------------------
      inProgressStates: {},

      toggleInProgressState: (state) => {
        set((s) => {
          const updated = {
            ...s.inProgressStates,
            [state]: !s.inProgressStates[state]
          };

          const itemsWithCycle = recomputeCycleFields(
            s.items,
            updated,
            s.workflowStates
          );

          const { metrics, throughputHistory } = computeAllMetricsPure(
            itemsWithCycle,
            s.workflowStates
          );
          const summary = computeSummaryPure(itemsWithCycle, metrics);

          return {
            inProgressStates: updated,
            hasUserCustomizedInProgress: true,
            items: itemsWithCycle,
            metrics,
            throughputHistory,
            summary
          };
        });
      },

      // -------------------------------------------------------
      // CSV METADATA
      // -------------------------------------------------------
      uploadedFileName: null,
      setUploadedFileName: (name) => set({ uploadedFileName: name }),

      // -------------------------------------------------------
      // RAW ITEMS (already normalized by parseWorkflowCsv)
      // -------------------------------------------------------
      items: [],

      setItems: (items) => {
        const { workflowStates, inProgressStates } = get();

        set(() => {
          const itemsWithCycle = recomputeCycleFields(
            items,
            inProgressStates,
            workflowStates
          );

          const { metrics, throughputHistory } = computeAllMetricsPure(
            itemsWithCycle,
            workflowStates
          );
          const summary = computeSummaryPure(itemsWithCycle, metrics);

          return {
            items: itemsWithCycle,
            metrics,
            throughputHistory,
            summary,
            howManyResults: [],
            howManyPercentiles: {},
            whenHowLongResults: [],
            whenHowLongPercentiles: {}
          };
        });
      },

      // -------------------------------------------------------
      // METRICS + SUMMARY (no longer called directly)
      // -------------------------------------------------------
      metrics: {
        cfd: [],
        wipRun: [],
        throughputRun: [],
        cycleHistogram: [],
        cycleTimeScatter: []
      },

      throughputHistory: [],

      summary: {
        totalItems: 0,
        completedItems: 0,
        avgCycleTime: 0,
        avgThroughput: 0
      },

      // -------------------------------------------------------
      // DATA WINDOW SETTINGS
      // -------------------------------------------------------
      windowSettings: {
        windowStart: null,
        windowEnd: null,
        useFullDataset: false
      },

      setWindowSettings: (settings) =>
        set({
          windowSettings: {
            ...get().windowSettings,
            ...settings
          }
        }),

      // -------------------------------------------------------
      // MONTE CARLO — HOW MANY
      // -------------------------------------------------------
      howManyResults: [],
      howManyPercentiles: {},
      howManySettings: {
        startDate: null,
        endDate: null,
        simCount: null
      },

      setHowManyResults: (results) => set({ howManyResults: results }),
      setHowManyPercentiles: (p) => set({ howManyPercentiles: p }),
      setHowManySettings: (settings) =>
        set({
          howManySettings: {
            ...get().howManySettings,
            ...settings
          }
        }),

      // -------------------------------------------------------
      // MONTE CARLO — WHEN / HOW LONG
      // -------------------------------------------------------
      whenHowLongResults: [],
      whenHowLongPercentiles: {},
      whenHowLongSettings: {
        targetCount: null,
        simCount: null
      },

      setWhenHowLongResults: (results) =>
        set({ whenHowLongResults: results }),
      setWhenHowLongPercentiles: (p) =>
        set({ whenHowLongPercentiles: p }),
      setWhenHowLongSettings: (settings) =>
        set({
          whenHowLongSettings: {
            ...get().whenHowLongSettings,
            ...settings
          }
        }),

      // -------------------------------------------------------
      // RESET STORE
      // -------------------------------------------------------
      resetStore: () =>
        set({
          items: [],
          metrics: {
            cfd: [],
            wipRun: [],
            throughputRun: [],
            cycleHistogram: [],
            cycleTimeScatter: [],
			agingWip: [],
			cycleTimePercentiles: {}
          },
          throughputHistory: [],
          summary: {
            totalItems: 0,
            completedItems: 0,
            avgCycleTime: 0,
            avgThroughput: 0
          },
          uploadedFileName: null,

          howManyResults: [],
          howManyPercentiles: {},
          whenHowLongResults: [],
          whenHowLongPercentiles: {}
        })
    }),

    // -------------------------------------------------------
    // PERSISTENCE CONFIG (C1)
    // -------------------------------------------------------
    {
      name: "analytics-store",
      partialize: (state) => ({
        workflowStates: state.workflowStates,
        workflowVisibility: state.workflowVisibility,
        inProgressStates: state.inProgressStates,
        hasUserCustomizedInProgress: state.hasUserCustomizedInProgress
      })
    }
  )
);

if (typeof window !== "undefined") {
  window.store = useAnalyticsStore;
}