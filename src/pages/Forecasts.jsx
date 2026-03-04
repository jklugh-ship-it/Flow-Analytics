// src/pages/Forecasts.jsx

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import HowManyPanel from "./HowManyPanel";
import WhenHowLongPanel from "./WhenHowLongPanel";
import ThroughputPreviewChart from "../components/charts/ThroughputPreviewChart";
import PrimaryButton from "../components/PrimaryButton";

import { card, cardTitle } from "../styles/cards";

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
    <div style={{ padding: "1.5rem", maxWidth: "1400px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Forecasts</h1>

      {/* Throughput Preview */}
      <div style={{ ...card, marginBottom: "1.5rem" }}>
        <h2 style={cardTitle}>Throughput Preview</h2>
        <div style={{ position: "relative", width: "100%", height: 260 }}>
          <ThroughputPreviewChart
            throughputRun={throughputRun}
            startDate={startDateInput}
            endDate={endDateInput}
          />
        </div>
      </div>

      {/* Data Window Controls */}
      <div style={{ ...card, marginBottom: "1.5rem" }}>
        <h2 style={cardTitle}>Data Window</h2>
        <div className="forecast-controls">
          <div className="forecast-field">
            <label className="forecast-label">Start date</label>
            <input
              type="date"
              value={startDateInput || ""}
              onChange={(e) => setStartDateInput(e.target.value)}
              onBlur={commitStart}
            />
          </div>

          <div className="forecast-field">
            <label className="forecast-label">End date</label>
            <input
              type="date"
              value={endDateInput || ""}
              onChange={(e) => setEndDateInput(e.target.value)}
              onBlur={commitEnd}
            />
          </div>

          <div className="forecast-field forecast-field--action">
            <PrimaryButton onClick={resetWindow}>Reset to Full Dataset</PrimaryButton>
          </div>
        </div>
      </div>

      {/* Simulation Panels */}
      <div className="forecasts-panels">
        <HowManyPanel throughputWindow={filtered} />
        <WhenHowLongPanel throughputWindow={filtered} />
      </div>

      <style>{`
        .forecast-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-end;
        }
        .forecast-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 120px;
        }
        .forecast-field--action {
          justify-content: flex-end;
        }
        .forecast-label {
          font-size: 0.85rem;
          font-weight: 500;
          opacity: 0.75;
        }
        .forecasts-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .forecast-field {
            width: 100%;
          }
          .forecast-field input {
            width: 100%;
            box-sizing: border-box;
          }
          .forecasts-panels {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}