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

// Custom tick: label each bin value under the X-axis
const BinTick = ({ x, y, payload }) => {
  if (!payload || payload.value === undefined) return null;

  return (
    <text
      x={x}
      y={y + 12}
      textAnchor="middle"
      fill="#374151"
      fontSize={12}
    >
      {payload.value}
    </text>
  );
};

export default function MonteCarloHistogram({ results }) {
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

  // Precompute the list of bin values for ticks
  const binValues = useMemo(
    () => histogram.map((h) => h.value),
    [histogram]
  );

  // -------------------------------------------------------
  // Percentiles (05th, 15th, 50th)
  // -------------------------------------------------------
  const percentiles = useMemo(() => {
    if (!results || results.length === 0) return {};

    const sorted = results.map(Number).sort((a, b) => a - b);
    const pick = (p) => sorted[Math.floor(p * sorted.length)];

    return {
      p05: pick(0.05),
      p15: pick(0.15),
      p50: pick(0.5)
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
            ticks={binValues}      // <- force one tick per bin
            interval={0}           // <- show all ticks
            tick={<BinTick />}     // <- custom renderer
            allowDecimals={false}
          />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />

          <Bar
            dataKey="count"
            fill="#10b981"
            isAnimationActive={false}
            barSize={20}
          />

          {percentiles.p05 !== undefined && (
            <ReferenceLine
              x={percentiles.p05}
              stroke="#7c3aed"
              strokeDasharray="3 3"
              label={{ value: "5th", position: "top", fill: "#7c3aed" }}
            />
          )}
          {percentiles.p15 !== undefined && (
            <ReferenceLine
              x={percentiles.p15}
              stroke="#dc2626"
              strokeDasharray="3 3"
              label={{ value: "15th", position: "top", fill: "#dc2626" }}
            />
          )}
          {percentiles.p50 !== undefined && (
            <ReferenceLine
              x={percentiles.p50}
              stroke="#2563eb"
              strokeDasharray="3 3"
              label={{ value: "50th", position: "top", fill: "#2563eb" }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}