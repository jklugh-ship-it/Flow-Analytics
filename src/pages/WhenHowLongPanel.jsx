// src/pages/WhenHowLongPanel.jsx

import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import useMonteCarloWhenHowLong from "../hooks/useMonteCarloWhenHowLong";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

export default function WhenHowLongPanel({ throughputWindow }) {
  const fullThroughput = useAnalyticsStore((s) => s.throughputHistory);

  const targetCount = useAnalyticsStore((s) => s.whenHowLongSettings.targetCount);
  const simCount = useAnalyticsStore((s) => s.whenHowLongSettings.simCount);
  const startDate = useAnalyticsStore((s) => s.whenHowLongSettings.startDate);

  const results = useAnalyticsStore((s) => s.whenHowLongResults);
  const percentiles = useAnalyticsStore((s) => s.whenHowLongPercentiles);

  const setSettings = useAnalyticsStore((s) => s.setWhenHowLongSettings);
  const setResults = useAnalyticsStore((s) => s.setWhenHowLongResults);
  const setPercentiles = useAnalyticsStore((s) => s.setWhenHowLongPercentiles);

  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Initialize once
// This effect intentionally runs only once on mount.
// It initializes default settings if none exist.
/* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (targetCount && simCount) return;

    setSettings({
      targetCount: targetCount ?? 10,
      simCount: simCount ?? 2000
    });
  }, []);
/* eslint-enable react-hooks/exhaustive-deps */

  const guardrailMessage = useMemo(() => {
    if (!fullThroughput || fullThroughput.length === 0)
      return "No throughput data available.";

    if (fullThroughput.every((t) => t === 0))
      return "Throughput history contains only zeros.";

    if (!targetCount || targetCount <= 0)
      return "Target count must be at least 1.";

    if (!simCount || simCount < 100)
      return "Simulation count must be at least 100.";

    return null;
  }, [fullThroughput, targetCount, simCount]);

  const runSimulation = useMonteCarloWhenHowLong({
    throughputWindow,
    fullThroughput,
    targetCount,
    numSimulations: simCount,
    setResults,
    setPercentiles,
    setFallbackUsed,
  });

  const handleRun = useCallback(() => {
    if (!guardrailMessage) runSimulation();
  }, [guardrailMessage, runSimulation]);
  
  const histogramData = useMemo(() => {
    if (!results || results.length === 0) return [];
    const counts = new Map();
    results.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value - b.value);
  }, [results]);

  const { p50, p85, p95 } = percentiles;

  const endDates = useMemo(() => {
    if (!startDate || !p50) return null;

    const base = new Date(startDate);
    const add = (d) => {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + d);
      return dt.toISOString().slice(0, 10);
    };

    return {
      p50: add(p50),
      p85: add(p85),
      p95: add(p95)
    };
  }, [startDate, p50, p85, p95]);

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2>When / How Long?</h2>

      {/* Controls */}
      <section style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label>Target count</label>
          <input
            type="number"
            min={1}
            value={targetCount ?? ""}
            onChange={(e) =>
              setSettings({ targetCount: Number(e.target.value) || null })
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
        <div>
          <label>Start date (optional)</label>
          <input
            type="date"
            value={startDate || ""}
            onChange={(e) =>
              setSettings({ startDate: e.target.value || null })
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
              There is a <strong>50%</strong> chance of finishing in{" "}
              <strong>{p50}</strong> days or fewer
              {startDate && endDates ? ` (around ${endDates.p50})` : ""}.
            </li>
            <li>
              There is a <strong>85%</strong> chance of finishing in{" "}
              <strong>{p85}</strong> days or fewer
              {startDate && endDates ? ` (around ${endDates.p85})` : ""}.
            </li>
            <li>
              There is a <strong>95%</strong> chance of finishing in{" "}
              <strong>{p95}</strong> days or fewer
              {startDate && endDates ? ` (around ${endDates.p95})` : ""}.
            </li>
          </ul>
        )}
      </section>

      {/* Histogram */}
      <section>
        <h3>Distribution of completion times</h3>
        {histogramData.length === 0 ? (
          <p>No data yet. Run a simulation.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={histogramData}>
              <XAxis dataKey="value" type="number" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" isAnimationActive={false} />
              {p50 && (
                <ReferenceLine x={p50} stroke="green" strokeDasharray="3 3" label="P50" />
              )}
              {p85 && (
                <ReferenceLine x={p85} stroke="orange" strokeDasharray="3 3" label="P85" />
              )}
              {p95 && (
                <ReferenceLine x={p95} stroke="red" strokeDasharray="3 3" label="P95" />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}