// src/components/Stability.jsx

import React from "react";

function fmt(val) {
  if (val == null) return "—";
  return Number(val).toFixed(2);
}

const COLUMNS = [
  { key: "arrivalRate", label: "Arrival Rate", hint: "Items entering first active state per day" },
  { key: "throughput",  label: "Throughput",   hint: "Items completed per day" },
  { key: "wipAge",      label: "WIP Age",       hint: "Average age of active items (days), as of this period" }
];

const PERIODS = [
  { key: "today",     label: "Today" },
  { key: "lastWeek",  label: "Last Week" },
  { key: "lastMonth", label: "Last Month" }
];

export default function Stability({ today, lastWeek, lastMonth }) {
  const data = { today, lastWeek, lastMonth };

  return (
    <div style={{ width: "100%" }}>
      <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 0, marginBottom: "1rem" }}>
        For all data, as of:
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", paddingBottom: "0.5rem", color: "#6b7280", fontWeight: 500 }} />
            {PERIODS.map(({ key, label }) => (
              <th
                key={key}
                style={{
                  textAlign: "right",
                  paddingBottom: "0.5rem",
                  color: key === "today" ? "#2563eb" : "#374151",
                  fontWeight: key === "today" ? 700 : 500,
                  fontSize: key === "today" ? "1rem" : "0.9rem"
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COLUMNS.map(({ key, label, hint }) => (
            <tr key={key} style={{ borderTop: "1px solid #f3f4f6" }}>
              <td
                style={{ padding: "0.6rem 0", color: "#374151", cursor: "help" }}
                title={hint}
              >
                {label}
              </td>
              {PERIODS.map(({ key: period }) => (
                <td
                  key={period}
                  style={{
                    textAlign: "right",
                    padding: "0.6rem 0",
                    fontWeight: period === "today" ? 600 : 400,
                    color: period === "today" ? "#111827" : "#6b7280"
                  }}
                >
                  {fmt(data[period]?.[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.75rem", marginBottom: 0 }}>
        Hover metric labels for definitions
      </p>
    </div>
  );
}
