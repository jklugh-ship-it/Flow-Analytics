// src/pages/Analytics/MonteCarlo.jsx

import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import MonteCarloSummary from "../../components/charts/MonteCarloSummary";

export default function MonteCarlo() {
  const throughputRun = useAnalyticsStore((s) => s.metrics.throughputRun);

  return (
    <div>
      <h2>Monte Carlo Forecasting</h2>
      <MonteCarloSummary throughputRun={throughputRun} />
    </div>
  );
}