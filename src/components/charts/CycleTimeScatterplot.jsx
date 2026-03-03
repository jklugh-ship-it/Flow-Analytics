import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from "recharts";

export default function CycleTimeScatterplot({ data, percentiles }) {
  if (!data || !data.length) return <div>No cycle time scatter data</div>;

  const { p50, p85, p95 } = percentiles || {};

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Cycle Time Scatterplot</h3>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <XAxis dataKey="date" name="Completed" />
          <YAxis dataKey="value" name="Cycle Time" />
          <Tooltip />

          <Scatter data={data} fill="#ef4444" />

          {p50 !== undefined && (
            <ReferenceLine
              y={p50}
              stroke="#2563eb"
              strokeDasharray="3 3"
              label="P50"
            />
          )}
          {p85 !== undefined && (
            <ReferenceLine
              y={p85}
              stroke="#10b981"
              strokeDasharray="3 3"
              label="P85"
            />
          )}
          {p95 !== undefined && (
            <ReferenceLine
              y={p95}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label="P95"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}