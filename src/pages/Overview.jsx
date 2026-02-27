import React from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import WorkflowFlowGraphic from "../components/WorkflowFlowGraphic";
import CfdChart from "../components/charts/CfdChart";
import AgingWipChart from "../components/charts/AgingWipChart";
import {
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
const {
  metrics,
  workflowStates,
  workflowVisibility,
  inProgressStates
} = useAnalyticsStore();

const {
  cfd,
  wipRun,
  throughputRun,
  cycleHistogram,
  cycleTimeScatter,
  agingWip,
  cycleTimePercentiles
} = metrics;

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
       <WorkflowFlowGraphic
  workflowStates={workflowStates}
  workflowVisibility={workflowVisibility}
  inProgressStates={inProgressStates}
/>

      </section>

      {/* CFD */}
      <section style={{ marginBottom: "2rem" }}>
  <CfdChart
    data={cfd}
    workflowOrder={workflowStates}
    workflowVisibility={workflowVisibility}
  />
</section>
      {/* Aging WIP */}
      <section style={{ marginBottom: "2rem" }}>
        <AgingWipChart
          agingWip={agingWip}
          workflowStates={workflowStates}
          workflowVisibility={workflowVisibility}
          cycleTimePercentiles={cycleTimePercentiles}
        />
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