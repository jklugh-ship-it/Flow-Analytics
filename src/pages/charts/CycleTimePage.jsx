import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import CycleTimeHistogram from "../../components/charts/CycleTimeHistogram";
import CycleTimeScatterplot from "../../components/charts/CycleTimeScatterplot";
import { card, cardTitle } from "../../styles/cards";

export default function CycleTimePage() {
  const { metrics } = useAnalyticsStore();
  const { cycleHistogram, cycleTimeScatter, cycleTimePercentiles } = metrics;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1400px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Cycle Time</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={card}>
          <h2 style={cardTitle}>Distribution</h2>
          <CycleTimeHistogram
            data={cycleHistogram}
            percentiles={cycleTimePercentiles}
          />
        </div>

        <div style={card}>
          <h2 style={cardTitle}>Scatterplot</h2>
          <CycleTimeScatterplot
            data={cycleTimeScatter}
            percentiles={cycleTimePercentiles}
          />
        </div>
      </div>
    </div>
  );
}
