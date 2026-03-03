import React from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import WorkflowFlowGraphic from "../components/WorkflowFlowGraphic";
import CycleTime from "../components/CycleTime";
import Wip from "../components/Wip";
import Stability from "../components/Stability";

export default function Overview() {
  const {
    metrics,
    workflowStates,
    workflowVisibility,
    inProgressStates
  } = useAnalyticsStore();

  const {
    cycleTimePercentiles,
    wipItems,
    wipStateCounts,
    stability
  } = metrics;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Overview</h1>

      {/* WORKFLOW CONTEXT GRAPHIC */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Workflow</h3>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%"
          }}
        >
          <div style={{ display: "inline-block" }}>
            <WorkflowFlowGraphic
              workflowStates={workflowStates}
              workflowVisibility={workflowVisibility}
              inProgressStates={inProgressStates}
            />
          </div>
        </div>
      </section>

      {/* SUMMARY METRICS: Cycle Time / WIP / Stability */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem",
          alignItems: "start"
        }}
      >
        {/* Cycle Time */}
        <div style={{ borderRadius: "8px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem", textAlign: "left" }}>
            Cycle Time
          </h3>

          <div
            style={{
              padding: "1rem",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <CycleTime percentiles={cycleTimePercentiles} />
          </div>
        </div>

        {/* Current WIP */}
        <div style={{ borderRadius: "8px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem", textAlign: "left" }}>
            Current WIP
          </h3>

          <div
            style={{
              padding: "1rem",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Wip wipItems={wipItems} stateCounts={wipStateCounts} />
          </div>
        </div>

        {/* Stability */}
        <div style={{ borderRadius: "8px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem", textAlign: "left" }}>
            Stability
          </h3>

          <div
            style={{
              padding: "1rem",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <Stability
              today={stability.today}
              lastWeek={stability.lastWeek}
              lastMonth={stability.lastMonth}
            />
          </div>
        </div>
      </section>
    </div>
  );
}