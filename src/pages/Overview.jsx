// src/pages/Overview.jsx

import React from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import WorkflowFlowGraphic from "../components/WorkflowFlowGraphic";
import CycleTime from "../components/CycleTime";
import Wip from "../components/Wip";
import Stability from "../components/Stability";
import { card, cardTitle } from "../styles/cards";

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
    <div style={{ padding: "1.5rem", maxWidth: "1400px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Overview</h1>

      {/* Workflow graphic */}
      <div style={{ ...card, marginBottom: "1.5rem" }}>
        <h2 style={cardTitle}>Workflow</h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ display: "inline-block" }}>
            <WorkflowFlowGraphic
              workflowStates={workflowStates}
              workflowVisibility={workflowVisibility}
              inProgressStates={inProgressStates}
            />
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        alignItems: "start"
      }}>
        <div style={card}>
          <h2 style={cardTitle}>Cycle Time</h2>
          <CycleTime percentiles={cycleTimePercentiles} />
        </div>

        <div style={card}>
          <h2 style={cardTitle}>Current WIP</h2>
          <Wip wipItems={wipItems} stateCounts={wipStateCounts} />
        </div>

        <div style={card}>
          <h2 style={cardTitle}>Stability</h2>
          <Stability
            today={stability.today}
            lastWeek={stability.lastWeek}
            lastMonth={stability.lastMonth}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .overview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
