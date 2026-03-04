// src/components/SampleDataLoader.jsx

import React, { useState } from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import { parseWorkflowCsv } from "../utils/parseWorkflowCsv";

const SAMPLES = [
  {
    label: "Software Dev Team",
    file: "/samples/software_dev.csv",
    description: "Stable team, predictable flow. Good for exploring the UI."
  },
  {
    label: "IT Ops / Support",
    file: "/samples/it_ops.csv",
    description: "High volume with a bottleneck that builds then partially resolves."
  },
  {
    label: "Marketing & Content",
    file: "/samples/marketing_content.csv",
    description: "Low throughput, irregular cadence, long-tail cycle times."
  }
];

export default function SampleDataLoader() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const setItems = useAnalyticsStore((s) => s.setItems);
  const setWorkflowStates = useAnalyticsStore((s) => s.setWorkflowStates);
  const setUploadedFileName = useAnalyticsStore((s) => s.setUploadedFileName);

  const loadSample = async (sample) => {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(sample.file);
      if (!res.ok) throw new Error(`Could not fetch ${sample.file}`);
      const text = await res.text();

      const { items, workflowStates: detected, errors } = parseWorkflowCsv(text);

      if (errors.length > 0) {
        setStatus({ type: "error", message: errors.join(" ") });
        return;
      }

      if (detected.length > 0) {
        setWorkflowStates(detected.map((s) => s.replace(/^entered_/, "")));
      }

      setItems(items);
      setUploadedFileName(sample.label);
      setStatus({ type: "success", message: `Loaded ${items.length} items — ${sample.label}.` });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ marginBottom: "0.75rem", opacity: 0.8 }}>
        Not ready to upload your own data? Load a sample dataset to explore the app.
        <br />
        <small style={{ opacity: 0.7 }}>This is simulated data for demonstration purposes only.</small>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {SAMPLES.map((sample) => (
          <button
            key={sample.file}
            type="button"
            onClick={() => loadSample(sample)}
            disabled={loading}
            style={{
              textAlign: "left",
              padding: "0.6rem 0.9rem",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              background: loading ? "#f3f4f6" : "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            <strong>{sample.label}</strong>
            <span style={{ display: "block", fontSize: "0.85em", opacity: 0.7 }}>
              {sample.description}
            </span>
          </button>
        ))}
      </div>

      {status && (
        <div
          style={{
            marginTop: "0.75rem",
            color: status.type === "error" ? "#b91c1c" : "#065f46",
            fontSize: "0.9em"
          }}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
