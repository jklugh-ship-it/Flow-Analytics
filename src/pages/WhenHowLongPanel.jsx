import React, { useEffect, useMemo } from "react";
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

export default function WhenHowLongPage() {
  const throughputHistory = useAnalyticsStore((s) => s.throughputHistory);
  const workflowStates = useAnalyticsStore((s) => s.workflowStates);
  const uploadedFileName = useAnalyticsStore((s) => s.uploadedFileName);

  // Persistent state
  const results = useAnalyticsStore((s) => s.whenHowLongResults);
  const percentiles = useAnalyticsStore((s) => s.whenHowLongPercentiles);
  const settings = useAnalyticsStore((s) => s.whenHowLongSettings);

  const setResults = useAnalyticsStore((s) => s.setWhenHowLongResults);
  const setPercentiles = useAnalyticsStore((s) => s.setWhenHowLongPercentiles);
  const setSettings = useAnalyticsStore((s) => s.setWhenHowLongSettings);

  //
  // ────────────────────────────────────────────────────────────────
  // Initialize defaults only once
  // ────────────────────────────────────────────────────────────────
  //
  // We intentionally run this only once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (settings.targetCount == null) {
      setSettings({ targetCount: 10 });
    }
    if (settings.simCount == null) {
      setSettings({ simCount: 2000 });
    }
  }, []);

  const targetCount = settings.targetCount;
  const simCount = settings.simCount;

  //
  // ────────────────────────────────────────────────────────────────
  // Stable simulation runner (memoized)
  // ────────────────────────────────────────────────────────────────
  //
  const runSimulation = useMemo(() => {
    return useMonteCarloWhenHowLong({
      throughputHistory,
      workflowStates,
      targetCount,
      numSimulations: simCount,
      setResults,
      setPercentiles
    });
  }, [
    throughputHistory,
    workflowStates,
    targetCount,
    simCount,
    setResults,
    setPercentiles
  ]);

  //
  // ────────────────────────────────────────────────────────────────
  // Guardrails (memoized)
  // ────────────────────────────────────────────────────────────────
  //
  const guardrailMessage = useMemo(() => {
    if (!throughputHistory || throughputHistory.length === 0) {
      return "No throughput data available. Upload a dataset first.";
    }
    if (throughputHistory.every((t) => t === 0)) {
      return "Throughput history contains only zeros. No items can be completed.";
    }
    if (targetCount <= 0) {
      return "Target count must be greater than zero.";
    }
    if (simCount < 100) {
      return "Simulation count must be at least 100 for a stable forecast.";
    }
    return null;
  }, [throughputHistory, targetCount, simCount]);

  //
  // ────────────────────────────────────────────────────────────────
  // Automatically rerun simulation when inputs change
  // ────────────────────────────────────────────────────────────────
  //
  useEffect(() => {
    if (guardrailMessage) return;
    if (!throughputHistory || throughputHistory.length === 0) return;

    runSimulation();
  }, [
    guardrailMessage,
    throughputHistory,
    targetCount,
    simCount
    // ❗ runSimulation intentionally omitted — it's stable via useMemo
  ]);

  //
  // ────────────────────────────────────────────────────────────────
  // Histogram bucketing
  // ────────────────────────────────────────────────────────────────
  //
  const histogramData = useMemo(() => {
    if (!results.length) return [];
    const counts = new Map();
    results.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value - b.value);
  }, [results]);

  const { p50, p85, p95 } = percentiles;

  //
  // ────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────
  //
  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>When Will We Finish?</h1>

      {/* Global CSV status */}
      <div style={{ fontStyle: "italic", opacity: 0.8, marginBottom: "1rem" }}>
        {uploadedFileName
          ? `Using data from: ${uploadedFileName}`
          : "No data uploaded"}
      </div>

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

      {/* Controls */}
      <section style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Target item count: </label>
          <input
            type="number"
            value={targetCount}
            min={1}
            onChange={(e) =>
              setSettings({ targetCount: Number(e.target.value) })
            }
            style={{ width: "100px", marginLeft: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Simulations: </label>
          <input
            type="number"
            value={simCount}
            min={100}
            onChange={(e) => setSettings({ simCount: Number(e.target.value) })}
            style={{ width: "100px", marginLeft: "0.5rem" }}
          />
        </div>

        <button
          onClick={runSimulation}
          disabled={!!guardrailMessage}
          style={{
            padding: "0.5rem 1rem",
            background: guardrailMessage ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: guardrailMessage ? "not-allowed" : "pointer"
          }}
        >
          Run Simulation
        </button>
      </section>

      {/* Results */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>Results</h3>

        {p50 != null ? (
          <ul>
            <li>
              50% probability of completing <strong>{targetCount}</strong> items
              in <strong>{p50}</strong> days or less
            </li>
            <li>
              85% probability of completing <strong>{targetCount}</strong> items
              in <strong>{p85}</strong> days or less
            </li>
            <li>
              95% probability of completing <strong>{targetCount}</strong> items
              in <strong>{p95}</strong> days or less
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
              <Tooltip
                formatter={(v) => v}
                labelFormatter={(v) => `${Math.round(v)} days`}
              />
              <Bar dataKey="count" fill="#3b82f6" />

              {p50 != null && (
                <ReferenceLine
                  x={p50}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label="P50"
                />
              )}
              {p85 != null && (
                <ReferenceLine
                  x={p85}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label="P85"
                />
              )}
              {p95 != null && (
                <ReferenceLine
                  x={p95}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label="P95"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}