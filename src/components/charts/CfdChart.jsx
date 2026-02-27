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
import { useAnalyticsStore } from "../../store/useAnalyticsStore";

// -------------------------------------------------------
// Helper: is an item in a given state on a given day?
// -------------------------------------------------------
function isInStateOnDay(item, state, workflowStates, day) {
  const idx = workflowStates.indexOf(state);
  if (idx === -1) return false;

  const enteredDate =
    item.entered?.[`entered_${state}`] ??
    item.entered?.[state];

  if (!(enteredDate instanceof Date)) return false;
  if (enteredDate > day) return false;

  const nextState = workflowStates[idx + 1];

  if (!nextState) {
    // Last state: item is in this state from entered[last] through cycleEnd
    return (
      item.cycleEnd instanceof Date &&
      enteredDate <= day &&
      day <= item.cycleEnd
    );
  }

  const nextEntered =
    item.entered?.[`entered_${nextState}`] ??
    item.entered?.[nextState];

  return !(nextEntered instanceof Date) || nextEntered > day;
}

// -------------------------------------------------------
// Custom Tooltip
// -------------------------------------------------------
function CfdTooltip({ active, payload, label, workflowOrder, workflowVisibility }) {
  if (!active || !payload || payload.length === 0) return null;

  const day = new Date(label);
  const items = useAnalyticsStore.getState().items;

  const visibleStates = workflowOrder.filter((s) => workflowVisibility[s]);

  return (
    <div style={{ background: "white", padding: "0.5rem", border: "1px solid #ccc" }}>
      <strong>{label}</strong>
      {visibleStates.map((state) => {
        const count = items.filter((item) =>
          isInStateOnDay(item, state, workflowOrder, day)
        ).length;

        return (
          <div key={state}>
            {state}: {count}
          </div>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------
// Custom Legend (workflow order, not alphabetical)
// -------------------------------------------------------
function CfdLegend({ workflowOrder, workflowVisibility, colors }) {
  const visibleStates = workflowOrder.filter((s) => workflowVisibility[s]);

  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {visibleStates.map((state, idx) => (
        <div key={state} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: colors[idx % colors.length],
              marginRight: 6
            }}
          />
          {state}
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------
// Main CFD Component
// -------------------------------------------------------
export default function CfdChart({ data, workflowOrder, workflowVisibility }) {
  if (!data || data.length === 0) return <div>No CFD data</div>;

  // 1. Determine visible states
  const visibleStates = workflowOrder.filter((s) => workflowVisibility[s]);

  // 2. Extend CFD to today
  const extendedData = (() => {
    const rows = [...data];
    const last = rows[rows.length - 1];
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);

    let cursor = new Date(last.date);
    cursor.setDate(cursor.getDate() + 1);

    while (cursor.toISOString().slice(0, 10) <= todayISO) {
      const iso = cursor.toISOString().slice(0, 10);
      rows.push({ ...last, date: iso });
      cursor.setDate(cursor.getDate() + 1);
    }

    return rows;
  })();

  // 3. Filter hidden states out of each row
  const filteredData = extendedData.map((row) => {
    const newRow = { date: row.date };
    visibleStates.forEach((state) => {
      if (state in row) newRow[state] = row[state];
    });
    return newRow;
  });

  // 4. Color palette
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
        <AreaChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />

          <Tooltip
            content={
              <CfdTooltip
                workflowOrder={workflowOrder}
                workflowVisibility={workflowVisibility}
              />
            }
          />

          <Legend
            content={
              <CfdLegend
                workflowOrder={workflowOrder}
                workflowVisibility={workflowVisibility}
                colors={colors}
              />
            }
          />

          {visibleStates.map((state, idx) => (
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