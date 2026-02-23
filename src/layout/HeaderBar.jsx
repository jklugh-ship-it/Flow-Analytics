import React from "react";
import { useLocation } from "react-router-dom";
import Papa from "papaparse";
import { useAnalyticsStore } from "../store/useAnalyticsStore";

export default function HeaderBar() {
  const location = useLocation();

  // Store actions
  const setItems = useAnalyticsStore((s) => s.setItems);
  const workflowStates = useAnalyticsStore((s) => s.workflowStates);
  const resetStore = useAnalyticsStore((s) => s.resetStore);

  // NEW: global CSV filename
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
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setItems(results.data); // triggers normalization + metrics + summary
      }
    });
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
            type="file"
            accept=".csv"
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