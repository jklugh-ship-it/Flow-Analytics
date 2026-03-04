import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import CfdChart from "../../components/charts/CfdChart";
import { card, cardTitle } from "../../styles/cards";

export default function CfdPage() {
  const { metrics, workflowStates, workflowVisibility } = useAnalyticsStore();
  const { cfd } = metrics;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1400px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Cumulative Flow Diagram</h1>

      <div style={card}>
        <h2 style={cardTitle}>Cumulative Flow</h2>
        <CfdChart
          data={cfd}
          workflowOrder={workflowStates}
          workflowVisibility={workflowVisibility}
        />
      </div>
    </div>
  );
}
