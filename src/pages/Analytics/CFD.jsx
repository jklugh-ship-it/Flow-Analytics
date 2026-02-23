// src/pages/Analytics/CFD.jsx

import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import CfdChart from "../../components/charts/CfdChart";

export default function CFD() {
  const cfd = useAnalyticsStore((s) => s.metrics.cfd);
  const workflowStates = useAnalyticsStore((s) => s.workflowStates);
  const workflowVisibility = useAnalyticsStore((s) => s.workflowVisibility);

  return (
    <div>
      <h2>Cumulative Flow Diagram</h2>
      <CfdChart
        data={cfd}
        workflowOrder={workflowStates}
        workflowVisibility={workflowVisibility}
      />
    </div>
  );
}