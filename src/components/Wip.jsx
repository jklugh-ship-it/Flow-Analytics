// src/components/Wip.jsx

import React from "react";

export default function Wip({ wipItems, stateCounts }) {
  const total = wipItems?.length ?? 0;

  const filteredStates = Object.entries(stateCounts || {}).filter(
    ([state]) => state !== "Resolved"
  );

  return (
    <div style={{ width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <span style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1 }}>
          {total}
        </span>
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem", color: "#6b7280" }}>
          items currently in progress
        </p>
      </div>

      <div>
        {filteredStates.map(([state, count]) => {
          const isReady = state === "Ready";
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div
              key={state}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: "1px solid #f3f4f6"
              }}
            >
              <span
                style={{ fontSize: "0.9rem", color: "#374151", cursor: isReady ? "help" : "default" }}
                title={
                  isReady
                    ? "Items appear in Ready when they previously entered an in‑progress state but moved backward or have not yet progressed again."
                    : undefined
                }
              >
                {state}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{pct}%</span>
                <span style={{ fontWeight: 600, minWidth: "1.5rem", textAlign: "right" }}>
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
