// src/layout/HeaderBar.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import { parseWorkflowCsv } from "../utils/parseWorkflowCsv";
import PrimaryButton from"../components/PrimaryButton";

// External trigger for LandingPage or other components
export function triggerHeaderCsvUpload() {
  const input = document.getElementById("header-csv-input");
  if (input) input.click();
}

export default function HeaderBar({ onMenuClick }) {
  const location = useLocation();

// ---Upload Button Styling---
const uploadButtonStyle = {
  background: "#2563eb",
  color: "white",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "40px",
  fontSize: "0.95rem",
  fontWeight: 500,
  lineHeight: 1,
  fontFamily: "inherit",
  appearance: "none",
  WebkitAppearance: "none"
};

  // Store actions
  const {
    setItems,
    setWorkflowStates,
    resetStore,
    uploadedFileName,
    setUploadedFileName
  } = useAnalyticsStore();

  // Route → Title mapping (aligned with new chart pages)
  const titles = {
    "/": "Home",
    "/workflow": "Workflow Designer",
    "/analytics/overview": "Overview",
    "/analytics/cfd": "Cumulative Flow Diagram",
    "/analytics/wip": "Work in Progress",
    "/analytics/throughput": "Throughput Run",
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
      {/* LEFT SIDE: Hamburger (mobile) + Title + Data Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Hamburger — only visible on mobile */}
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem",
            fontSize: "1.5rem",
            lineHeight: 1,
            color: "#1f2937"
          }}
        >
          ☰
        </button>

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
      </div>

      {/* RIGHT SIDE: Global Actions */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {/* Upload CSV */}
        <label style={uploadButtonStyle}>
          Upload CSV
          <input
            id="header-csv-input"
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvUpload}
            style={{ display: "none" }}
          />
        </label>

        {/* Reset Data */}
        <PrimaryButton onClick={resetData}>Reset Data</PrimaryButton>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}