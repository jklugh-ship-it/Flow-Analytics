// src/components/charts/ThroughputHistogram.jsx

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const { count, days } = payload[0].payload;
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", padding: "0.5rem 0.75rem", fontSize: 13 }}>
      <div><strong>{count} item{count !== 1 ? "s" : ""}</strong> completed in a day</div>
      <div style={{ color: "#6b7280" }}>{days} day{days !== 1 ? "s" : ""} had this count</div>
    </div>
  );
}

export default function ThroughputHistogram({ data }) {
  const histogram = useMemo(() => {
    if (!data || data.length === 0) return [];

    const freq = new Map();
    for (const { count } of data) {
      freq.set(count, (freq.get(count) || 0) + 1);
    }

    return [...freq.entries()]
      .map(([count, days]) => ({ count, days }))
      .sort((a, b) => a.count - b.count);
  }, [data]);

  if (!histogram.length) return <div>No throughput data</div>;

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "0.25rem" }}>Throughput Distribution</h3>
      <p style={{ margin: "0 0 1rem", fontSize: 13, color: "#6b7280" }}>
        How frequently each daily completion count occurred
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={histogram} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="count"
            label={{ value: "Items completed in a day", position: "insideBottom", offset: -4, fontSize: 12, fill: "#6b7280" }}
            height={45}
            allowDecimals={false}
          />
          <YAxis
            allowDecimals={false}
            label={{ value: "Days", angle: -90, position: "insideLeft", fontSize: 12, fill: "#6b7280" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="days" fill="#10b981" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
