// src/pages/HowManyPanel.jsx

import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import useMonteCarloHowMany from "../hooks/useMonteCarloHowMany";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

export default function HowManyPanel({ throughputWindow }) {
  const fullThroughput = useAnalyticsStore((s) => s.throughputHistory);

  const startDate = useAnalyticsStore((s) => s.howManySettings.startDate);
  const endDate = useAnalyticsStore((s) => s.howManySettings.endDate);
  const simCount = useAnalyticsStore((s) => s.howManySettings.simCount);

  const results = useAnalyticsStore((s) => s.howManyResults);
  const percentiles = useAnalyticsStore((s) => s.howManyPercentiles);

  const setSettings = useAnalyticsStore((s) => s.setHowManySettings);
  const setResults = useAnalyticsStore((s) => s.setHowManyResults);
  const setPercentiles = useAnalyticsStore((s) => s.setHowManyPercentiles);

  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Initialize settings once
// This effect intentionally runs only once on mount.
// It initializes default settings if none exist.
/* eslint-disable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (startDate && endDate && simCount) return;

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() + 1);

    const end = new Date(start);
    end.setDate(end.getDate() + 13);

    setSettings({
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      simCount: 2000
    });
  }, []);
/* eslint-enable react-hooks/exhaustive-deps */

  // Compute number of days in forecast horizon
  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    return Math.max(1, Math.ceil((e - s) / 86400000) + 1);
  }, [startDate, endDate]);

  // Guardrails
  const guardrailMessage = useMemo(() => {
    if (!fullThroughput || fullThroughput.length === 0)
      return "No throughput data available.";

    if (fullThroughput.every((t) => t === 0))
      return "Throughput history contains only zeros.";

    if (!startDate || !endDate) return "Select a valid date range.";

    if (days <= 0) return "The forecast horizon must be at least one day.";

    if (!simCount || simCount < 100)
      return "Simulation count must be at least 100.";

    return null;
  }, [fullThroughput, startDate, endDate, days, simCount]);

  // Hook
  const runSimulation = useMonteCarloHowMany({
    throughputWindow,
    fullThroughput,
    days,
    numSimulations: simCount,
    setResults,
    setPercentiles,
    setFallbackUsed
  });

  const handleRun = useCallback(() => {
    if (!guardrailMessage) runSimulation();
  }, [guardrailMessage, runSimulation]);

  // Histogram
  const histogramData = useMemo(() => {
    if (!results || results.length === 0) return [];
    const counts = new Map();
    results.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value - b.value);
  }, [results]);

  const { p05, p15, p50 } = percentiles;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2>How Many Can We Finish?</h2>

      {/* Controls */}
      <section style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label>Start date</label>
          <input
            type="date"
            value={startDate || ""}
            onChange={(e) =>
              setSettings({ startDate: e.target.value || null })
            }
          />
        </div>
        <div>
          <label>End date</label>
          <input
            type="date"
            value={endDate || ""}
            onChange={(e) =>
              setSettings({ endDate: e.target.value || null })
            }
          />
        </div>
        <div>
          <label>Simulations</label>
          <input
            type="number"
            min={100}
            value={simCount ?? ""}
            onChange={(e) =>
              setSettings({ simCount: Number(e.target.value) || null })
            }
          />
        </div>
        <div style={{ alignSelf: "flex-end" }}>
          <button onClick={handleRun} disabled={!!guardrailMessage}>
            Run Simulation
          </button>
        </div>
      </section>

      {guardrailMessage && (
        <div style={{ background: "#fee2e2", padding: "0.75rem", marginBottom: "0.75rem" }}>
          {guardrailMessage}
        </div>
      )}

      {fallbackUsed && (
        <div style={{ background: "#fff3cd", padding: "0.75rem", marginBottom: "0.75rem" }}>
          Selected window has fewer than 5 data points. Using full dataset instead.
        </div>
      )}

      {/* Results */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h3>Results</h3>
        {!p50 ? (
          <p>No simulation run yet.</p>
        ) : (
          <ul>
            <li>
              There is a <strong>95%</strong> chance of completing at least{" "}
              <strong>{p05}</strong> items.
            </li>
            <li>
              There is a <strong>85%</strong> chance of completing at least{" "}
              <strong>{p15}</strong> items.
            </li>
            <li>
              There is a <strong>50%</strong> chance of completing at least{" "}
              <strong>{p50}</strong> items.
            </li>
          </ul>
        )}
      </section>

      {/* Histogram */}
      <section>
        <h3>Distribution</h3>
        {histogramData.length === 0 ? (
          <p>No data yet. Run a simulation.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={histogramData}>
              <XAxis dataKey="value" type="number" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" isAnimationActive={false} />
              {p05 && (
                <ReferenceLine x={p05} stroke="red" strokeDasharray="3 3" label="P05" />
              )}
              {p15 && (
                <ReferenceLine x={p15} stroke="orange" strokeDasharray="3 3" label="P15" />
              )}
              {p50 && (
                <ReferenceLine x={p50} stroke="green" strokeDasharray="3 3" label="P50" />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}