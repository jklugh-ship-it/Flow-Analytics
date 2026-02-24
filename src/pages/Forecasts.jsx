// src/pages/Forecasts.jsx

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import HowManyPanel from "./HowManyPanel";
import WhenHowLongPanel from "./WhenHowLongPanel";
import ThroughputPreviewChart from "../components/charts/ThroughputPreviewChart";

export default function Forecasts() {
  const throughputRun = useAnalyticsStore((s) => s.metrics.throughputRun);

  // Compute max index whenever data changes
  const maxIndex = throughputRun.length > 0 ? throughputRun.length - 1 : 0;

  // Text inputs (single source of truth)
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  // Committed indices (only update on blur or Enter)
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(maxIndex);

  // ⭐ Reset window automatically when new data loads
  useEffect(() => {
    if (throughputRun.length > 0) {
      const newMax = throughputRun.length - 1;
      setStartIndex(0);
      setEndIndex(newMax);
    }
  }, [throughputRun]);

  // Commit handlers
  const commitStart = useCallback(() => {
    if (!startDateInput) {
      setStartIndex(0);
      return;
    }
    const dt = new Date(startDateInput);
    if (isNaN(dt)) return;

    const idx = throughputRun.findIndex((d) => new Date(d.date) >= dt);
    setStartIndex(idx === -1 ? 0 : idx);
  }, [startDateInput, throughputRun]);

  const commitEnd = useCallback(() => {
    if (!endDateInput) {
      setEndIndex(maxIndex);
      return;
    }
    const dt = new Date(endDateInput);
    if (isNaN(dt)) return;

    const idx = throughputRun.findIndex((d) => new Date(d.date) >= dt);
    setEndIndex(idx === -1 ? maxIndex : Math.max(idx, startIndex));
  }, [endDateInput, throughputRun, startIndex, maxIndex]);

  // Key handler for Enter
  const handleKey = (e, commitFn) => {
    if (e.key === "Enter") commitFn();
  };

  // Filter throughput based on committed window
  const filtered = useMemo(() => {
    if (!throughputRun.length) return [];
    return throughputRun.slice(startIndex, endIndex + 1);
  }, [throughputRun, startIndex, endIndex]);

  // Reset
  const resetWindow = () => {
    setStartDateInput("");
    setEndDateInput("");
    setStartIndex(0);
    setEndIndex(maxIndex);
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Forecasts</h1>

      {/* Top Row: Preview + Controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "2rem",
          marginBottom: "2rem"
        }}
      >
        {/* Throughput Preview */}
        <section>
          <h3>Throughput Preview</h3>

          <div style={{ position: "relative", width: "100%", height: 260 }}>
            <ThroughputPreviewChart
              throughputRun={throughputRun}
              startDate={startDateInput}
              endDate={endDateInput}
            />
          </div>
        </section>

        {/* Date Window Controls */}
        <section>
          <h3>Data Window</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label>
              Start Date
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                onBlur={commitStart}
                onKeyDown={(e) => handleKey(e, commitStart)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  fontFamily: "monospace"
                }}
              />
            </label>

            <label>
              End Date
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                onBlur={commitEnd}
                onKeyDown={(e) => handleKey(e, commitEnd)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  fontFamily: "monospace"
                }}
              />
            </label>

            <button
              onClick={resetWindow}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 0.75rem",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Reset to Full Dataset
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Row: Two Panels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          alignItems: "start"
        }}
      >
        <HowManyPanel throughputWindow={filtered} />
        <WhenHowLongPanel throughputWindow={filtered} />
      </div>
    </div>
  );
}