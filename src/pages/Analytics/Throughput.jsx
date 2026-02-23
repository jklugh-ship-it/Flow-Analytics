// src/pages/Analytics/Throughput.jsx

import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import ThroughputRunChart from "../../components/charts/ThroughputRunChart";

export default function Throughput() {
  const throughputRun = useAnalyticsStore((s) => s.metrics.throughputRun);

  return (
    <div>
      <h2>Throughput Run Chart</h2>
      <ThroughputRunChart data={throughputRun} />
    </div>
  );
}