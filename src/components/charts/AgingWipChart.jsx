import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer
} from "recharts";

export default function AgingWipChart({
  agingWip,
  workflowStates,
  workflowVisibility,
  cycleTimePercentiles
}) {
  if (!agingWip || agingWip.length === 0) {
    return <div>No aging WIP data</div>;
  }

  const visibleStates = workflowStates.filter((s) => workflowVisibility[s]);

  const stateToIndex = new Map(
    visibleStates.map((s, i) => [s, i])
  );

  const data = agingWip
    .filter((pt) => stateToIndex.has(pt.state))
    .map((pt) => ({
      id: pt.id,
      x: stateToIndex.get(pt.state),
      y: pt.ageDays
    }));

  const { p50, p70, p85, p95 } = cycleTimePercentiles || {};
  const refLines = [
    { key: "50%", value: p50, color: "#999" },
    { key: "70%", value: p70, color: "#999" },
    { key: "85%", value: p85, color: "#999" },
    { key: "95%", value: p95, color: "#999" }
  ].filter((r) => typeof r.value === "number");

  function AgingTooltip({ active, payload }) {
    if (!active || !payload || payload.length === 0) return null;

    const idx = payload[0].payload.x;
    const state = visibleStates[idx];

    return (
      <div style={{ background: "white", padding: "0.5rem", border: "1px solid #ccc" }}>
        <strong>{state}</strong>
        <div>Age: {payload[0].payload.y} days</div>
      </div>
    );
  }

  return (
    <div>
      <h3>Aging Work In Progress</h3>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>

          <CartesianGrid strokeDasharray="3 3" />

          {/* Shaded workflow-state lanes */}
          {visibleStates.map((state, i) => (
            <ReferenceArea
              key={state}
              x1={i - 0.5}
              x2={i + 0.5}
              y1={0}
              y2="auto"
              fill={i % 2 === 0 ? "#f7f7f7" : "#efefef"}
              fillOpacity={1}
              stroke="none"
            />
          ))}

          <XAxis
            type="number"
            dataKey="x"
            domain={[-0.5, visibleStates.length - 0.5]}
            tick={false}      // hide default ticks
            axisLine={true}
            tickLine={false}
          />

          <YAxis
            type="number"
            dataKey="y"
            name="Age (days)"
            allowDecimals={false}
          />

          <Tooltip content={<AgingTooltip />} />

          {refLines.map((r) => (
            <ReferenceLine
              key={r.key}
              y={r.value}
              stroke={r.color}
              strokeDasharray="4 4"
              label={`${r.key} (${r.value}d)`}
            />
          ))}

          <Scatter
            name="Work items"
            data={data}
            fill="#8884d8"
          />

        </ScatterChart>
      </ResponsiveContainer>

      {/* State labels under shaded regions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: -40,
          padding: "5 5px"
        }}
      >
        {visibleStates.map((state) => (
          <div
            key={state}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 12,
              color: "#444"
            }}
          >
            {state}
          </div>
        ))}
      </div>
    </div>
  );
}