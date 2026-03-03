import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import CycleTimeHistogram from "../../components/charts/CycleTimeHistogram";
import CycleTimeScatterplot from "../../components/charts/CycleTimeScatterplot";

export default function CycleTimePage() {
  const { metrics } = useAnalyticsStore();
  const { cycleHistogram, cycleTimeScatter, cycleTimePercentiles } = metrics;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Cycle Time</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <CycleTimeHistogram
          data={cycleHistogram}
          percentiles={cycleTimePercentiles}
        />

        <CycleTimeScatterplot
          data={cycleTimeScatter}
          percentiles={cycleTimePercentiles}
        />
      </div>
    </div>
  );
}