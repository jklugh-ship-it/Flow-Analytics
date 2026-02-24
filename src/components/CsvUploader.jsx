// src/components/CsvUploader.jsx

import React, { useRef, useState } from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import { parseWorkflowCsv } from "../utils/parseWorkflowCsv";

console.log("CSV UPLOADER MOUNTED");


export default function CsvUploader() {
  const fileInputRef = useRef(null);

  const [uploadError, setUploadError] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);

  const workflowStates = useAnalyticsStore((s) => s.workflowStates);
  const setItems = useAnalyticsStore((s) => s.setItems);
  const setUploadedFileName = useAnalyticsStore((s) => s.setUploadedFileName);
  const setWorkflowStates = useAnalyticsStore((s) => s.setWorkflowStates);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadInfo(null);

    const text = await file.text();

    // Parse CSV into normalized items
    const { items, errors } = parseWorkflowCsv(text, workflowStates);

    if (errors.length > 0) {
      setUploadError(errors.join(" "));
      e.target.value = "";
      return;
    }
const { items, workflowStates: detected, errors } = parseWorkflowCsv(text);
console.log("PARSED ITEMS:", items);
console.log("DETECTED STATES:", detected);
console.log("ERRORS:", errors);

    // CSV is authoritative → detect workflow states from normalized items
    const first = items[0];
    const detectedStates = first ? Object.keys(first.entered || {}) : [];

    if (detectedStates.length > 0) {
      setWorkflowStates(detectedStates);
    }

    // Store normalized items
    setItems(items);
    setUploadedFileName(file.name);

    setUploadInfo(`Loaded ${items.length} items from ${file.name}.`);

    // Allow re-upload of same file
    e.target.value = "";
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        Upload Workflow CSV
      </label>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        style={{ marginBottom: "0.5rem" }}
      >
        Choose CSV File
      </button>

      <input
        type="file"
        accept=".csv,text/csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {uploadError && (
        <div style={{ color: "#b91c1c", marginTop: "0.5rem" }}>
          {uploadError}
        </div>
      )}

      {uploadInfo && (
        <div style={{ color: "#065f46", marginTop: "0.5rem" }}>
          {uploadInfo}
        </div>
      )}
    </div>
  );
}