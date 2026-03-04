// src/pages/Analytics/MonteCarlo.jsx

import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import MonteCarloSummary from "../../components/charts/MonteCarloSummary";
import { card, cardTitle } from "../../styles/cards";

export default function MonteCarlo() {
  const throughputRun = useAnalyticsStore((s) => s.metrics.throughputRun);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1400px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Monte Carlo Forecasting</h1>

      <div style={card}>
        <h2 style={cardTitle}>Forecast Summary</h2>
        <MonteCarloSummary throughputRun={throughputRun} />
      </div>
    </div>
  );
}
