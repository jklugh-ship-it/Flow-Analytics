// src/pages/WorkflowPage.jsx

import React from "react";
import WorkflowDesigner from "../components/WorkflowDesigner";

export default function WorkflowPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Workflow Designer</h1>
      <p style={{ marginBottom: "1.5rem", opacity: 0.8 }}>
        Define, reorder, merge, and manage your workflow states. Changes update
        all analytics automatically.
      </p>

      <WorkflowDesigner />
    </div>
  );
}