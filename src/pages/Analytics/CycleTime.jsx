// src/pages/Analytics/CycleTime.jsx

import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import CycleTimeHistogram from "../../components/charts/CycleTimeHistogram";
import CycleTimeScatterplot from "../../components/charts/CycleTimeScatterplot";

export default function CycleTime() {
  const histogram = useAnalyticsStore((s) => s.metrics.cycleHistogram);
  const scatter = useAnalyticsStore((s) => s.metrics.cycleScatter);

  return (
    <div>
      <h2>Cycle Time</h2>

      <h3>Histogram</h3>
      <CycleTimeHistogram data={histogram} />

      <h3 style={{ marginTop: "2rem" }}>Scatterplot</h3>
      <CycleTimeScatterplot data={scatter} />
    </div>
  );
}