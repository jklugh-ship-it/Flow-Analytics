// src/store/useAnalyticsStore.js

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { computeDefaultInProgress } from "../utils/workflow/computeDefaultInProgress";
import { normalizeVisibility } from "../utils/workflow/normalizeVisibility";
import {
  addWorkflowState as addWorkflowStateFn,
  deleteWorkflowState as deleteWorkflowStateFn,
  mergeWorkflowStates as mergeWorkflowStatesFn
} from "../utils/workflow/workflowMutations";

// UPDATED PATH — now points to the modularized recomputeEverything
import { recomputeEverything } from "../utils/recompute/recomputeEverything";

export const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      // WORKFLOW CONFIGURATION
      workflowStates: [],
      workflowVisibility: {},
      inProgressStates: {},
      hasUserCustomizedInProgress: false,

      // RAW ITEMS (already normalized by parseWorkflowCsv)
      items: [],

      setWorkflowStates: (states) => {
        const prev = get();

        const visibility = normalizeVisibility(prev.workflowVisibility, states);
        const inProgress = computeDefaultInProgress(states);

        // Warn for 2-state workflow with no working states
        const anyInProgress = Object.values(inProgress).some(Boolean);
        if (!anyInProgress && states.length === 2) {
          alert(
            "Your workflow has only two states. By default, the first and last " +
              "states are treated as 'waiting' and 'done', so neither is marked " +
              "as a working state. To calculate cycle time, mark at least one " +
              "state as 'In Progress'."
          );
        }

        set({
          workflowStates: states,
          workflowVisibility: visibility,
          inProgressStates: inProgress,
          hasUserCustomizedInProgress: prev.hasUserCustomizedInProgress
        });

        recomputeEverything(get, set);
      },

      toggleWorkflowVisibility: (stateName) => {
        const prev = get();
        set({
          workflowVisibility: {
            ...prev.workflowVisibility,
            [stateName]: !prev.workflowVisibility[stateName]
          }
        });
      },

      addWorkflowState: (name) => {
        const updated = addWorkflowStateFn(get().workflowStates, name);
        get().setWorkflowStates(updated);
      },

      deleteWorkflowState: (name) => {
        const updated = deleteWorkflowStateFn(get().workflowStates, name);
        get().setWorkflowStates(updated);
      },

      mergeWorkflowStates: (names, newName) => {
        const updated = mergeWorkflowStatesFn(get().workflowStates, names, newName);
        get().setWorkflowStates(updated);
      },

      toggleInProgressState: (stateName) => {
        const prev = get();
        const updated = {
          ...prev.inProgressStates,
          [stateName]: !prev.inProgressStates[stateName]
        };

        set({
          inProgressStates: updated,
          hasUserCustomizedInProgress: true
        });

        recomputeEverything(get, set);
      },

      // CSV METADATA
      uploadedFileName: null,
      setUploadedFileName: (name) => set({ uploadedFileName: name }),

      // METRICS + SUMMARY (computed, not user-set)
      metrics: {
        cfd: [],
        wipRun: [],
        throughputRun: [],
        cycleHistogram: [],
        cycleTimeScatter: [],
        agingWip: [],
        cycleTimePercentiles: {},
        wipItems: [],
        wipStateCounts: {},
        stability: {
			today: { arrivalRate: 0, throughput: 0, wipAge: 0 },
			lastWeek: { arrivalRate: 0, throughput: 0, wipAge: 0 },
			lastMonth: { arrivalRate: 0, throughput: 0, wipAge: 0 }
			}
      },

      throughputHistory: [],

      summary: {
        totalItems: 0,
        completedItems: 0,
        avgCycleTime: 0,
        avgThroughput: 0
      },

      setItems: (items) => {
        set({ items });
        recomputeEverything(get, set);
      },

      // DATA WINDOW SETTINGS
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

      // MONTE CARLO — HOW MANY
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

      // MONTE CARLO — WHEN / HOW LONG
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

      // RESET STORE
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
            cycleTimePercentiles: {},
            wipItems: [],
            wipStateCounts: {},
            stability: undefined
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