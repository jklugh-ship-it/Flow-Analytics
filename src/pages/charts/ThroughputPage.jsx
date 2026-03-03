import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import ThroughputRunChart from "../../components/charts/ThroughputRunChart";

export default function ThroughputPage() {
  const { metrics } = useAnalyticsStore();
  const { throughputRun } = metrics;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Throughput Run</h1>

      <ThroughputRunChart data={throughputRun} />
    </div>
  );
}