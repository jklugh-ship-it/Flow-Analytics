// src/components/CycleTime.jsx

import React from "react";

export default function CycleTime({ percentiles }) {
  if (!percentiles) return null;

  const { p50, p85, p95 } = percentiles;

  const rows = [
    { label: "50th percentile", value: p50 },
    { label: "85th percentile", value: p85 },
    { label: "95th percentile", value: p95 }
  ];

  return (
    <div style={{ width: "100%" }}>
      {rows.map(({ label, value }) => (
        <div
          key={label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "0.6rem 0",
            borderBottom: "1px solid #f3f4f6"
          }}
        >
          <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>{label}</span>
          <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
            {value != null ? `${value} days` : "—"}
          </span>
        </div>
      ))}
      <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.75rem", marginBottom: 0 }}>
        Based on completed items only
      </p>
    </div>
  );
}
