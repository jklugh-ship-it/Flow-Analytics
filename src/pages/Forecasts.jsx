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
  const clearForecastResults = useAnalyticsStore((s) => s.clearForecastResults);

  const maxIndex = throughputRun.length > 0 ? throughputRun.length - 1 : 0;

  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(maxIndex);

  // Reset window when new data loads
  useEffect(() => {
    if (throughputRun.length > 0) {
      setStartIndex(0);
      setEndIndex(throughputRun.length - 1);
      setStartDateInput("");
      setEndDateInput("");
    }
  }, [throughputRun]);

  // Shared helper: convert a date string to the nearest index
  const dateToIndex = useCallback((dateStr, fallback) => {
    if (!dateStr) return fallback;
    const dt = new Date(dateStr);
    if (isNaN(dt)) return fallback;
    const idx = throughputRun.findIndex((d) => new Date(d.date) >= dt);
    return idx === -1 ? fallback : idx;
  }, [throughputRun]);

  // Manual date picker commit
  const commitStart = useCallback(() => {
    setStartIndex(dateToIndex(startDateInput, 0));
  }, [startDateInput, dateToIndex]);

  const commitEnd = useCallback(() => {
    const idx = dateToIndex(endDateInput, maxIndex);
    setEndIndex(Math.max(idx, startIndex));
  }, [endDateInput, dateToIndex, maxIndex, startIndex]);

  // Drag selection from chart — receives two date strings
  const handleRangeSelect = useCallback((a, b) => {
    const si = dateToIndex(a, 0);
    const ei = dateToIndex(b, maxIndex);
    setStartIndex(si);
    setEndIndex(ei);
    setStartDateInput(throughputRun[si]?.date || a);
    setEndDateInput(throughputRun[ei]?.date || b);
  }, [dateToIndex, maxIndex, throughputRun]);

  // Clear simulation results whenever the data window changes
  useEffect(() => {
    clearForecastResults();
  }, [startIndex, endIndex, clearForecastResults]);

  const filtered = useMemo(() => {
    if (!throughputRun.length) return [];
    return throughputRun.slice(startIndex, endIndex + 1);
  }, [throughputRun, startIndex, endIndex]);

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
            onRangeSelect={handleRangeSelect}
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
              onKeyDown={(e) => e.key === "Enter" && commitStart()}
            />
          </div>

          <div className="forecast-field">
            <label className="forecast-label">End date</label>
            <input
              type="date"
              value={endDateInput || ""}
              onChange={(e) => setEndDateInput(e.target.value)}
              onBlur={commitEnd}
              onKeyDown={(e) => e.key === "Enter" && commitEnd()}
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
