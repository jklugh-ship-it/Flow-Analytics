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

// Label that appears *only* under percentile lines
const PercentileLabel = ({ x, y, text, color }) => {
  if (x == null || y == null) return null;

  return (
    <text
      x={x}
      y={y + 20}
      textAnchor="middle"
      fill={color}
      fontSize={12}
      fontWeight="500"
    >
      {text}
    </text>
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

          {/* P50 */}
          {percentiles.p50 !== undefined && (
            <>
              <ReferenceLine
                x={percentiles.p50}
                stroke="#2563eb"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                x={percentiles.p50}
                label={
                  <PercentileLabel
                    color="#2563eb"
                    text={`P50 (${percentiles.p50})`}
                  />
                }
              />
            </>
          )}

          {/* P85 */}
          {percentiles.p85 !== undefined && (
            <>
              <ReferenceLine
                x={percentiles.p85}
                stroke="#7c3aed"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                x={percentiles.p85}
                label={
                  <PercentileLabel
                    color="#7c3aed"
                    text={`P85 (${percentiles.p85})`}
                  />
                }
              />
            </>
          )}

          {/* P95 */}
          {percentiles.p95 !== undefined && (
            <>
              <ReferenceLine
                x={percentiles.p95}
                stroke="#dc2626"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                x={percentiles.p95}
                label={
                  <PercentileLabel
                    color="#dc2626"
                    text={`P95 (${percentiles.p95})`}
                  />
                }
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}