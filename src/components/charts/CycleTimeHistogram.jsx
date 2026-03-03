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

export default function CycleTimeHistogram({ data, percentiles }) {
  if (!data || !data.length) return <div>No cycle time histogram data</div>;

  const { p50, p85, p95 } = percentiles || {};

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Cycle Time Histogram</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="value" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#f59e0b" />

          {p50 !== undefined && (
            <ReferenceLine x={p50} stroke="#2563eb" strokeDasharray="3 3" label="P50" />
          )}
          {p85 !== undefined && (
            <ReferenceLine x={p85} stroke="#10b981" strokeDasharray="3 3" label="P85" />
          )}
          {p95 !== undefined && (
            <ReferenceLine x={p95} stroke="#ef4444" strokeDasharray="3 3" label="P95" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}