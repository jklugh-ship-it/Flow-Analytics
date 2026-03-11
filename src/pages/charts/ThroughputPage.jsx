import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import ThroughputRunChart from "../../components/charts/ThroughputRunChart";
import ThroughputHistogram from "../../components/charts/ThroughputHistogram";
import { card, cardTitle } from "../../styles/cards";

export default function ThroughputPage() {
  const { metrics } = useAnalyticsStore();
  const { throughputRun } = metrics;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1400px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Throughput</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={card}>
          <h2 style={cardTitle}>Throughput Distribution</h2>
          <ThroughputHistogram data={throughputRun} />
        </div>

        <div style={card}>
          <h2 style={cardTitle}>Daily Throughput</h2>
          <ThroughputRunChart data={throughputRun} />
        </div>
      </div>
    </div>
  );
}
