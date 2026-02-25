import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function CfdChart({ data, workflowOrder, workflowVisibility }) {
  if (!data || data.length === 0) return <div>No CFD data</div>;

  // Use the first row to detect which workflow states actually appear in the data
  const sample = data[0];

  // Only include states that:
  // 1. Are in the workflow order
  // 2. Are visible
  // 3. Exist in the data rows
  const stateKeys = workflowOrder.filter(
    (state) => workflowVisibility[state] && Object.prototype.hasOwnProperty.call(sample, state)
  );

  // Stable color palette (extendable)
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
    "#ffc0cb"
  ];

  return (
    <div>
      <h3>Cumulative Flow Diagram</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />

          {stateKeys.map((state, idx) => (
            <Area
              key={state}
              type="monotone"
              dataKey={state}
              stackId="1"
              stroke={colors[idx % colors.length]}
              fill={colors[idx % colors.length]}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}