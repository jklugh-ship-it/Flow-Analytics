import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export default function ThroughputRunChart({ data }) {
  if (!data || data.length === 0) return <div>No throughput data</div>;

  // Show ~6 evenly spaced date labels regardless of dataset length
  const tickCount = Math.min(6, data.length);
  const interval = Math.floor((data.length - 1) / (tickCount - 1));
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    data[Math.min(i * interval, data.length - 1)].date
  );

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Throughput Over Time</h3>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="date"
            ticks={ticks}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={true}
          />
          <YAxis
            width={30}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.25}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
