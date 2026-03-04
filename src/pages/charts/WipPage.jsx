import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import AgingWipChart from "../../components/charts/AgingWipChart";
import WipRunChart from "../../components/charts/WipRunChart";
import { card, cardTitle } from "../../styles/cards";

export default function WipPage() {
  const { metrics, workflowStates, workflowVisibility } = useAnalyticsStore();
  const { agingWip, cycleTimePercentiles, wipRun } = metrics;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1400px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Work in Progress</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={card}>
          <h2 style={cardTitle}>Aging WIP</h2>
          <AgingWipChart
            agingWip={agingWip}
            workflowStates={workflowStates}
            workflowVisibility={workflowVisibility}
            cycleTimePercentiles={cycleTimePercentiles}
          />
        </div>

        <div style={card}>
          <h2 style={cardTitle}>WIP Over Time</h2>
          <WipRunChart data={wipRun} />
        </div>
      </div>
    </div>
  );
}
