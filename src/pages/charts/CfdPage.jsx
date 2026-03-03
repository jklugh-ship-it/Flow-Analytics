import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import CfdChart from "../../components/charts/CfdChart";

export default function CfdPage() {
  const { metrics, workflowStates, workflowVisibility } = useAnalyticsStore();
  const { cfd } = metrics;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Cumulative Flow Diagram</h1>

      <CfdChart
        data={cfd}
        workflowOrder={workflowStates}
        workflowVisibility={workflowVisibility}
      />
    </div>
  );
}