import React from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter
} from "recharts";

export default function Overview() {
  const metrics = useAnalyticsStore((s) => s.metrics);
  const workflowStates = useAnalyticsStore((s) => s.workflowStates);

  const { cfd, wipRun, throughputRun, cycleHistogram, cycleTimeScatter } =
    metrics;

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Overview</h1>

      {/* WORKFLOW CONTEXT GRAPHIC */}
      <section
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          background: "#fafafa"
        }}
      >
        <h3 style={{ marginTop: 0 }}>Workflow</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {workflowStates.map((s, idx) => (
            <div
              key={s}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "999px",
                background: `hsl(${idx * 60}, 70%, 85%)`,
                border: "1px solid #ccc",
                fontWeight: 500
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* CFD */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>Cumulative Flow Diagram</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cfd}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            {Object.keys(cfd[0] || {})
              .filter((k) => k !== "date")
              .map((state, idx) => (
                <Area
                  key={state}
                  type="monotone"
                  dataKey={state}
                  stackId="1"
                  stroke="#000"
                  fillOpacity={0.6}
                  fill={`hsl(${idx * 60}, 70%, 60%)`}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* WIP + Throughput */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem"
        }}
      >
        <section>
          <h3>WIP Run</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={wipRun}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section>
          <h3>Throughput Run</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={throughputRun}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* Cycle Time Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem"
        }}
      >
        <section>
          <h3>Cycle Time Histogram</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cycleHistogram}>
              <XAxis dataKey="value" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section>
          <h3>Cycle Time Scatterplot</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <XAxis dataKey="date" name="Completed" />
              <YAxis dataKey="value" name="Cycle Time" />
              <Tooltip />
              <Scatter data={cycleTimeScatter} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}