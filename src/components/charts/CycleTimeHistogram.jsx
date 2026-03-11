import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from "recharts";

const PERCENTILE_COLORS = {
  p50: "#2563eb",
  p70: "#10b981",
  p85: "#f59e0b",
  p95: "#ef4444"
};

function PercentileLegend({ percentiles }) {
  const entries = [
    { key: "p50", label: "P50" },
    { key: "p70", label: "P70" },
    { key: "p85", label: "P85" },
    { key: "p95", label: "P95" }
  ].filter(({ key }) => percentiles[key] != null);

  if (entries.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
      {entries.map(({ key, label }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: 12 }}>
          <div style={{
            width: 24, height: 2,
            background: PERCENTILE_COLORS[key],
            borderTop: `2px dashed ${PERCENTILE_COLORS[key]}`
          }} />
          <span style={{ color: PERCENTILE_COLORS[key], fontWeight: 600 }}>{label}</span>
          <span style={{ color: "#6b7280" }}>{percentiles[key]}d</span>
        </div>
      ))}
    </div>
  );
}

export default function CycleTimeHistogram({ data, percentiles }) {
  if (!data || !data.length) return <div>No cycle time histogram data</div>;

  const { p50, p70, p85, p95 } = percentiles || {};

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Cycle Time Histogram</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="value" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#f59e0b" />

          {p50 != null && <ReferenceLine x={p50} stroke={PERCENTILE_COLORS.p50} strokeDasharray="3 3" />}
          {p70 != null && <ReferenceLine x={p70} stroke={PERCENTILE_COLORS.p70} strokeDasharray="3 3" />}
          {p85 != null && <ReferenceLine x={p85} stroke={PERCENTILE_COLORS.p85} strokeDasharray="3 3" />}
          {p95 != null && <ReferenceLine x={p95} stroke={PERCENTILE_COLORS.p95} strokeDasharray="3 3" />}
        </BarChart>
      </ResponsiveContainer>

      <PercentileLegend percentiles={{ p50, p70, p85, p95 }} />
    </div>
  );
}
