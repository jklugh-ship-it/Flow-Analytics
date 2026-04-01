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
    { key: "50%", value: p50, color: "#2563eb" },
    { key: "70%", value: p70, color: "#10b981" },
    { key: "85%", value: p85, color: "#f59e0b" },
    { key: "95%", value: p95, color: "#ef4444" }
  ].filter((r) => typeof r.value === "number");

  // Ensure Y axis always shows all reference lines even if WIP items are young
  const maxRefValue = refLines.length > 0 ? Math.max(...refLines.map((r) => r.value)) : 0;

  function AgingTooltip({ active, payload }) {
    if (!active || !payload || payload.length === 0) return null;

    const idx = payload[0].payload.x;
    const ageDays = payload[0].payload.y;
    const state = visibleStates[idx];

    // Find all items at this exact position
    const matches = data.filter((pt) => pt.x === idx && pt.y === ageDays);
    const ids = matches.map((pt) => pt.id);

    return (
      <div style={{ background: "white", padding: "0.5rem", border: "1px solid #ccc" }}>
        <strong>{state}</strong>
        <div>Age: {ageDays} days</div>
        <div>{ids.length > 1 ? "Items: " : "Item: "}{ids.join(", ")}</div>
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
            domain={[0, (dataMax) => Math.max(dataMax, maxRefValue) * 1.1]}
          />

          <Tooltip content={<AgingTooltip />} />

          {refLines.map((r) => (
            <ReferenceLine
              key={r.key}
              y={r.value}
              stroke={r.color}
              strokeDasharray="4 4"
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
      {/* Percentile legend */}
      {refLines.length > 0 && (
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
          {refLines.map((r) => (
            <div key={r.key} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: 12 }}>
              <div style={{
                width: 24, height: 2,
                borderTop: `2px dashed ${r.color}`
              }} />
              <span style={{ color: r.color, fontWeight: 600 }}>{r.key}</span>
              <span style={{ color: "#6b7280" }}>{r.value}d</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
