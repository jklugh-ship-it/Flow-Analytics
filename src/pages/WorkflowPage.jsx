import React from "react";
import WorkflowDesigner from "../components/WorkflowDesigner";
import { card, cardTitle } from "../styles/cards";

export default function WorkflowPage() {
  return (
    <div style={{ padding: "1.5rem", maxWidth: "1400px" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Workflow Designer</h1>
      <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
        Define your workflow structure, visibility, and which states count as
        active work. Changes update all analytics automatically.
      </p>

      <div style={card}>
        <h2 style={cardTitle}>Workflow States</h2>
        <WorkflowDesigner />
      </div>
    </div>
  );
}
