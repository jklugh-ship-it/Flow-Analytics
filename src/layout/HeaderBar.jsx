// src/layout/HeaderBar.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import { parseWorkflowCsv } from "../utils/parseWorkflowCsv";

// Helper you can call from anywhere (e.g., LandingPage)
export function triggerHeaderCsvUpload() {
  const input = document.getElementById("header-csv-input");
  if (input) {
    input.click();
  }
}

export default function HeaderBar() {
  const location = useLocation();

  // Store actions
  const setItems = useAnalyticsStore((s) => s.setItems);
  const setWorkflowStates = useAnalyticsStore((s) => s.setWorkflowStates);
  const workflowStates = useAnalyticsStore((s) => s.workflowStates);
  const resetStore = useAnalyticsStore((s) => s.resetStore);

  // CSV filename
  const uploadedFileName = useAnalyticsStore((s) => s.uploadedFileName);
  const setUploadedFileName = useAnalyticsStore((s) => s.setUploadedFileName);

  // Map routes to human-friendly titles
  const titles = {
    "/": "Home",
    "/workflow": "Workflow Designer",
    "/analytics/overview": "Overview",
    "/analytics/cfd": "Cumulative Flow Diagram",
    "/analytics/wip": "WIP Run Chart",
    "/analytics/throughput": "Throughput Run Chart",
    "/analytics/cycle": "Cycle Time",
    "/analytics/montecarlo": "Monte Carlo Forecasting",
    "/analytics/montecarlo/howmany": "Monte Carlo – How Many",
    "/analytics/montecarlo/whenhowlong": "Monte Carlo – When / How Long"
  };

  const title = titles[location.pathname] || "Flow Analytics";

  // -----------------------------
  // ACTION: Upload CSV
  // -----------------------------
  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();

    // Parse CSV using the new ingestion pipeline
    const { items, workflowStates: detectedStates, errors } = parseWorkflowCsv(text);

    if (errors.length > 0) {
      alert(errors.join("\n"));
      e.target.value = "";
      return;
    }

    // CSV is authoritative → update workflow states
    if (detectedStates.length > 0) {
      setWorkflowStates(detectedStates);
    }

    // Store normalized items
    setItems(items);
    setUploadedFileName(file.name);

    // Allow re-upload of same file
    e.target.value = "";
  };

  // -----------------------------
  // ACTION: Save Workflow
  // -----------------------------
  const saveWorkflow = () => {
    localStorage.setItem("workflowStates", JSON.stringify(workflowStates));
    alert("Workflow saved");
  };

  // -----------------------------
  // ACTION: Reset Data
  // -----------------------------
  const resetData = () => {
    resetStore();
  };

  return (
    <header
      style={{
        width: "100%",
        padding: "1rem 1.5rem",
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
          {title}
        </h1>

        <div style={{ fontStyle: "italic", opacity: 0.8, marginTop: "0.25rem" }}>
          {uploadedFileName
            ? `Using data from: ${uploadedFileName}`
            : "No data uploaded"}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {/* Upload CSV */}
        <label
          style={{
            background: "#2563eb",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Upload CSV
          <input
            id="header-csv-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvUpload}
            style={{ display: "none" }}
          />
        </label>

        {/* Save Workflow */}
        <button
          onClick={saveWorkflow}
          style={{
            background: "#4b5563",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Save Workflow
        </button>

        {/* Reset Data */}
        <button
          onClick={resetData}
          style={{
            background: "#dc2626",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          Reset Data
        </button>
      </div>
    </header>
  );
}