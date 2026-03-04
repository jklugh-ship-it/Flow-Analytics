import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import ThroughputRunChart from "../../components/charts/ThroughputRunChart";
import { card, cardTitle } from "../../styles/cards";

export default function ThroughputPage() {
  const { metrics } = useAnalyticsStore();
  const { throughputRun } = metrics;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1400px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Throughput</h1>

      <div style={card}>
        <h2 style={cardTitle}>Daily Throughput</h2>
        <ThroughputRunChart data={throughputRun} />
      </div>
    </div>
  );
}
