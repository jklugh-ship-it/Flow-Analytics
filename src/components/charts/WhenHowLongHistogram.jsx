// src/components/charts/WhenHowLongHistogram.jsx

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

// Two-line label positioned inside the chart just below the top edge
const PercentileLabel = ({ viewBox, label, value, color }) => {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <g>
      <text x={x + 4} y={y + 14} fill={color} fontSize={11} fontWeight={600}>{label}</text>
      <text x={x + 4} y={y + 26} fill={color} fontSize={11}>{value}d</text>
    </g>
  );
};

export default function WhenHowLongHistogram({ results }) {
  // -------------------------------------------------------
  // Build histogram buckets: { value: number, count: number }
  // -------------------------------------------------------
  const histogram = useMemo(() => {
    if (!results || results.length === 0) return [];

    const counts = new Map();
    for (const r of results) {
      const numeric = Number(r);
      counts.set(numeric, (counts.get(numeric) || 0) + 1);
    }

    return [...counts.entries()]
      .map(([value, count]) => ({
        value: Number(value),
        count
      }))
      .sort((a, b) => a.value - b.value);
  }, [results]);

  // -------------------------------------------------------
  // Percentiles (50th, 85th, 95th)
  // -------------------------------------------------------
  const percentiles = useMemo(() => {
    if (!results || results.length === 0) return {};

    const sorted = results.map(Number).sort((a, b) => a - b);
    const pick = (p) => sorted[Math.floor(p * sorted.length)];

    return {
      p50: pick(0.5),
      p85: pick(0.85),
      p95: pick(0.95)
    };
  }, [results]);

  // -------------------------------------------------------
  // Domain padding so 0 isn't on the Y-axis
  // -------------------------------------------------------
  const domain = [
    (dataMin) => (dataMin === 0 ? -0.5 : dataMin - 0.5),
    (dataMax) => dataMax + 0.5
  ];

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={histogram}>
          <XAxis
  type="number"
  dataKey="value"
  domain={domain}
  allowDecimals={false}
  tick={false}        // <-- remove all tick labels
  tickLine={false}    // <-- remove tick marks
  axisLine={true}     // <-- keep the axis line
/>

          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />

          <Bar
            dataKey="count"
            fill="#10b981"
            isAnimationActive={false}
            barSize={20}
          />

          {percentiles.p50 !== undefined && (
            <ReferenceLine x={percentiles.p50} stroke="#2563eb" strokeDasharray="3 3"
              label={(props) => <PercentileLabel {...props} label="P50" value={percentiles.p50} color="#2563eb" />}
            />
          )}
          {percentiles.p85 !== undefined && (
            <ReferenceLine x={percentiles.p85} stroke="#7c3aed" strokeDasharray="3 3"
              label={(props) => <PercentileLabel {...props} label="P85" value={percentiles.p85} color="#7c3aed" />}
            />
          )}
          {percentiles.p95 !== undefined && (
            <ReferenceLine x={percentiles.p95} stroke="#dc2626" strokeDasharray="3 3"
              label={(props) => <PercentileLabel {...props} label="P95" value={percentiles.p95} color="#dc2626" />}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}