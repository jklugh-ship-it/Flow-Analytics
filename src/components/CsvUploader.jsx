import React, { useRef, useCallback } from "react";
import Papa from "papaparse";
import { useAnalyticsStore } from "../store/useAnalyticsStore";

function CsvUploader() {
  const setItems = useAnalyticsStore((s) => s.setItems);
  const setUploadedFileName = useAnalyticsStore((s) => s.setUploadedFileName);
  const uploadedFileName = useAnalyticsStore((s) => s.uploadedFileName);

  // Stable ref so React never remounts the input
  const fileInputRef = useRef(null);

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data || [];

          // Defensive: ensure rows is an array
          if (!Array.isArray(rows)) {
            console.error("CSV parse error: results.data is not an array", results);
            return;
          }

          // Push into store (normalization + metrics happen inside setItems)
          setItems(rows);
        } catch (err) {
          console.error("Error processing CSV:", err);
        } finally {
          // Reset input so the same file can be uploaded again
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    });
  }, [setItems, setUploadedFileName]);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        Upload CSV
      </label>

      <input
        key="csv-input-stable"
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        style={{ marginBottom: "0.5rem" }}
      />

      <div style={{ fontStyle: "italic", opacity: 0.8 }}>
        {uploadedFileName
          ? `Using data from: ${uploadedFileName}`
          : "No data uploaded"}
      </div>
    </div>
  );
}

export default React.memo(CsvUploader);