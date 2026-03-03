import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import AgingWipChart from "../../components/charts/AgingWipChart";
import WipRunChart from "../../components/charts/WipRunChart";

export default function WipPage() {
  const { metrics, workflowStates, workflowVisibility } = useAnalyticsStore();
  const { agingWip, cycleTimePercentiles, wipRun } = metrics;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Work in Progress</h1>

      {/* Aging WIP */}
      <section style={{ marginBottom: "2rem" }}>
        <AgingWipChart
          agingWip={agingWip}
          workflowStates={workflowStates}
          workflowVisibility={workflowVisibility}
          cycleTimePercentiles={cycleTimePercentiles}
        />
      </section>

      {/* WIP Run */}
      <section>
		<WipRunChart data={wipRun} />
      </section>
    </div>
  );
}