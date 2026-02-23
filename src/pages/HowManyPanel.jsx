// src/pages/HowManyPanel.jsx

import React, { useMemo, useEffect } from "react";
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
  //
  // ────────────────────────────────────────────────────────────────
  // Persistent Store State
  // ────────────────────────────────────────────────────────────────
  //
  const results = useAnalyticsStore((s) => s.howManyResults);
  const percentiles = useAnalyticsStore((s) => s.howManyPercentiles);
  const settings = useAnalyticsStore((s) => s.howManySettings);

  const setResults = useAnalyticsStore((s) => s.setHowManyResults);
  const setPercentiles = useAnalyticsStore((s) => s.setHowManyPercentiles);
  const setSettings = useAnalyticsStore((s) => s.setHowManySettings);

  const { startDate, endDate, simCount } = settings;

  //
  // ────────────────────────────────────────────────────────────────
  // Initialize default horizon: tomorrow → tomorrow+13
  // ────────────────────────────────────────────────────────────────
  //
 // We intentionally run this only once on mount.
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (!startDate || !endDate) {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() + 1);

    const end = new Date(start);
    end.setDate(end.getDate() + 13);

    setSettings({
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    });
  }
}, []);


  //
  // ────────────────────────────────────────────────────────────────
  // Compute forecast horizon (days)
  // ────────────────────────────────────────────────────────────────
  //
  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  //
  // ────────────────────────────────────────────────────────────────
  // Build dailyCounts from filtered throughput window
  // ────────────────────────────────────────────────────────────────
  //
  const dailyCounts = useMemo(() => {
    if (!throughputWindow || throughputWindow.length === 0) return [];
    return throughputWindow.map((d) => d.count);
  }, [throughputWindow]);

  //
  // ────────────────────────────────────────────────────────────────
  // Guardrails
  // ────────────────────────────────────────────────────────────────
  //
  const guardrailMessage = (() => {
    if (!dailyCounts.length) return "No throughput data in selected window.";
    if (dailyCounts.every((t) => t === 0))
      return "Throughput window contains only zeros.";
    if (!startDate || !endDate) return "Select both a start and end date.";
    if (days <= 0) return "End date must be after start date.";
    if (simCount < 100) return "Simulation count must be at least 100.";
    return null;
  })();

  //
  // ────────────────────────────────────────────────────────────────
  // Simulation Hook
  // ────────────────────────────────────────────────────────────────
  //
const runSimulation = useMonteCarloHowMany({
  throughputHistory: dailyCounts,
  days,
  simCount,
  setResults,
  setPercentiles
});


  //
  // ────────────────────────────────────────────────────────────────
  // Histogram
  // ────────────────────────────────────────────────────────────────
  //
  const histogramData = useMemo(() => {
    if (!results.length) return [];
    const counts = new Map();
    results.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    return [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value - b.value);
  }, [results]);

  const { p05: p5, p15, p50 } = percentiles;

  //
  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────
  //
  return (
    <div
      style={{
        background: "white",
        padding: "1.25rem",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}
    >
      <h2 style={{ marginTop: 0 }}>How Many Can We Finish?</h2>

      {/* Guardrails */}
      {guardrailMessage && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            marginBottom: "1.5rem"
          }}
        >
          {guardrailMessage}
        </div>
      )}

      {/* Forecast Horizon (Date Pickers) */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Forecast Start Date
        </label>
        <input
          type="date"
          value={startDate || ""}
          onChange={(e) => setSettings({ startDate: e.target.value })}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Forecast End Date
        </label>
        <input
          type="date"
          value={endDate || ""}
          onChange={(e) => setSettings({ endDate: e.target.value })}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <strong>Forecast Horizon:</strong> {days} days
      </div>

      {/* Simulation Count */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Number of Simulations
        </label>
        <input
          type="number"
          value={simCount}
          min={100}
          onChange={(e) => setSettings({ simCount: Number(e.target.value) })}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      {/* Run Button */}
      <button
        onClick={runSimulation}
        disabled={!!guardrailMessage}
        style={{
          padding: "0.75rem 1rem",
          background: guardrailMessage ? "#9ca3af" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: guardrailMessage ? "not-allowed" : "pointer",
          width: "100%",
          marginBottom: "1.5rem"
        }}
      >
        Run Simulation
      </button>

      {/* Results */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>Results</h3>
        {p50 != null ? (
          <ul>
            <li>
              95% probability of completing <strong>{p5}</strong> or more items
            </li>
            <li>
              85% probability of completing <strong>{p15}</strong> or more items
            </li>
            <li>
              50% probability of completing <strong>{p50}</strong> or more items
            </li>
          </ul>
        ) : (
          <p>No simulation run yet.</p>
        )}
      </section>

      {/* Histogram */}
      <section>
        <h3>Distribution</h3>

        {histogramData.length === 0 ? (
          <p>No data yet. Run a simulation.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={histogramData}>
              <XAxis
                dataKey="value"
                type="number"
                domain={[
                  (min) => min - 0.5,
                  (max) => max + 0.5
                ]}
                tickFormatter={(v) => Math.round(v)}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />

              {p5 != null && <ReferenceLine x={p5} stroke="#10b981" label="P5" />}
              {p15 != null && (
                <ReferenceLine x={p15} stroke="#f59e0b" label="P15" />
              )}
              {p50 != null && (
                <ReferenceLine x={p50} stroke="#ef4444" label="P50" />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}