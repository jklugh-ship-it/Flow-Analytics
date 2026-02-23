// src/store/useAnalyticsStore.js

import { create } from "zustand";
import {
  normalizeItems,
  computeCfd,
  computeWipRun,
  computeThroughputRun,
  computeCycleTimeHistogram,
  computeCycleTimeScatter
} from "../utils/metrics";

export const useAnalyticsStore = create((set, get) => ({

  // -------------------------------------------------------
  // WORKFLOW STATE
  // -------------------------------------------------------
  workflowStates: ["Refinement", "Development", "Testing", "Done"],

  workflowVisibility: {
    Refinement: true,
    Development: true,
    Testing: true,
    Done: true
  },

  // Replace entire workflow (drag/drop, merge, CSV ingestion)
  setWorkflowStates: (states) =>
    set((prev) => {
      const visibility = { ...prev.workflowVisibility };

      // Ensure visibility keys exist for all states
      states.forEach((s) => {
        if (!(s in visibility)) visibility[s] = true;
      });

      // Remove visibility keys for states no longer present
      Object.keys(visibility).forEach((s) => {
        if (!states.includes(s)) delete visibility[s];
      });

      return {
        workflowStates: states,
        workflowVisibility: visibility
      };
    }),

  toggleWorkflowVisibility: (stateName) =>
    set((prev) => ({
      workflowVisibility: {
        ...prev.workflowVisibility,
        [stateName]: !prev.workflowVisibility[stateName]
      }
    })),

  addWorkflowState: (name) =>
    set((prev) => ({
      workflowStates: [...prev.workflowStates, name],
      workflowVisibility: {
        ...prev.workflowVisibility,
        [name]: true
      }
    })),

  deleteWorkflowState: (name) =>
    set((prev) => {
      const updated = prev.workflowStates.filter((s) => s !== name);
      const visibility = { ...prev.workflowVisibility };
      delete visibility[name];

      return {
        workflowStates: updated,
        workflowVisibility: visibility
      };
    }),

  mergeWorkflowStates: (names, newName) =>
    set((prev) => {
      const updated = prev.workflowStates
        .filter((s) => !names.includes(s))
        .concat(newName);

      const visibility = { ...prev.workflowVisibility };
      names.forEach((n) => delete visibility[n]);
      visibility[newName] = true;

      return {
        workflowStates: updated,
        workflowVisibility: visibility
      };
    }),

  // -------------------------------------------------------
  // CSV METADATA
  // -------------------------------------------------------
  uploadedFileName: null,
  setUploadedFileName: (name) => set({ uploadedFileName: name }),

  // -------------------------------------------------------
  // RAW ITEMS
  // -------------------------------------------------------
  items: [],

  setItems: (items) => {
    // 1. Detect workflow states from CSV
    const detectedStates = Object.keys(items[0] || [])
      .filter((k) => k.startsWith("entered_"))
      .map((k) => k.replace("entered_", ""));

    // 2. Decide which workflow to use for normalization
    const workflowToUse =
      detectedStates.length > 0 ? detectedStates : get().workflowStates;

    // 3. If CSV defines workflow, update store BEFORE normalization
    if (detectedStates.length > 0) {
      get().setWorkflowStates(detectedStates);
    }

    // 4. Normalize using the correct workflow
    const normalized = normalizeItems(items, workflowToUse);

    // 5. Reset simulations when dataset changes
    set({
      items: normalized,
      howManyResults: [],
      howManyPercentiles: {},
      whenHowLongResults: [],
      whenHowLongPercentiles: {}
    });

    // 6. Recompute metrics + summary
    get().computeAllMetrics();
    get().computeSummary();
  },

  // -------------------------------------------------------
  // METRICS
  // -------------------------------------------------------
  metrics: {
    cfd: [],
    wipRun: [],
    throughputRun: [],
    cycleHistogram: [],
    cycleTimeScatter: []
  },

  throughputHistory: [],

  computeAllMetrics: () => {
    const { items, workflowStates } = get();

    const cfd = computeCfd(items, workflowStates);
    const wipRun = computeWipRun(items, workflowStates);
    const throughputRun = computeThroughputRun(items);
    const cycleHistogram = computeCycleTimeHistogram(items);
    const cycleTimeScatter = computeCycleTimeScatter(items);

    const throughputHistory = throughputRun.map((d) => d.count);

    set({
      metrics: {
        cfd,
        wipRun,
        throughputRun,
        cycleHistogram,
        cycleTimeScatter
      },
      throughputHistory
    });
  },

  // -------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------
  summary: {
    totalItems: 0,
    completedItems: 0,
    avgCycleTime: 0,
    avgThroughput: 0
  },

  computeSummary: () => {
    const { items, metrics } = get();

    const completed = items.filter((i) => i.completed).length;

    const avgCycle =
      metrics.cycleHistogram.length > 0
        ? Math.round(
            metrics.cycleHistogram.reduce(
              (sum, d) => sum + d.value * d.count,
              0
            ) /
              metrics.cycleHistogram.reduce((sum, d) => sum + d.count, 0)
          )
        : 0;

    const avgThroughput =
      metrics.throughputRun.length > 0
        ? Math.round(
            metrics.throughputRun.reduce((sum, d) => sum + d.count, 0) /
              metrics.throughputRun.length
          )
        : 0;

    set({
      summary: {
        totalItems: items.length,
        completedItems: completed,
        avgCycleTime: avgCycle,
        avgThroughput
      }
    });
  },

  // -------------------------------------------------------
  // MONTE CARLO — HOW MANY
  // -------------------------------------------------------
  howManyResults: [],
  howManyPercentiles: {},
  howManySettings: {
    startDate: null,
    endDate: null,
    simCount: 2000
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
    targetCount: 10,
    simCount: 2000
  },

  setWhenHowLongResults: (results) => set({ whenHowLongResults: results }),
  setWhenHowLongPercentiles: (p) => set({ whenHowLongPercentiles: p }),
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
        cycleTimeScatter: []
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
}));