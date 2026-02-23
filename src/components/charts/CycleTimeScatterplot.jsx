import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function CycleTimeScatterplot({ data }) {
  if (!data || !data.length) return <div>No cycle time scatter data</div>;
  return (
    <div>
      <h3>Cycle Time Scatterplot</h3>
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis dataKey="date" name="Completed" />
          <YAxis dataKey="cycleTime" name="Cycle Time (days)" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill="#82ca9d" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}