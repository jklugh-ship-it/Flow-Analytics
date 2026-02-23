// src/pages/Forecasts.jsx

import React, { useState, useMemo, useEffect } from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import HowManyPanel from "./HowManyPanel";
import WhenHowLongPanel from "./WhenHowLongPanel";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Forecasts() {
  const throughputRun = useAnalyticsStore((s) => s.metrics.throughputRun);

  const maxIndex = throughputRun.length > 0 ? throughputRun.length - 1 : 0;

  // Index-based window
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(maxIndex);

  // Raw text inputs (Option D)
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  // Derived dates from indices (safe)
  const startDate = useMemo(() => {
    if (!throughputRun.length) return null;
    if (startIndex < 0 || startIndex > maxIndex) return null;
    return new Date(throughputRun[startIndex].date);
  }, [throughputRun, startIndex, maxIndex]);

  const endDate = useMemo(() => {
    if (!throughputRun.length) return null;
    if (endIndex < 0 || endIndex > maxIndex) return null;
    return new Date(throughputRun[endIndex].date);
  }, [throughputRun, endIndex, maxIndex]);

  // Sync text inputs when indices change
  useEffect(() => {
    if (startDate) {
      setStartDateInput(startDate.toISOString().slice(0, 10));
    }
  }, [startIndex]);

  useEffect(() => {
    if (endDate) {
      setEndDateInput(endDate.toISOString().slice(0, 10));
    }
  }, [endIndex]);

  // Update index when typed date becomes valid
  useEffect(() => {
    if (!startDateInput) return;
    const dt = new Date(startDateInput);
    if (!isNaN(dt)) {
      const idx = throughputRun.findIndex((d) => new Date(d.date) >= dt);
      if (idx === -1) {
        setStartIndex(Math.max(0, endIndex - 1));
      } else {
        setStartIndex(Math.min(idx, endIndex - 1));
      }
    }
  }, [startDateInput, throughputRun, endIndex]);

  useEffect(() => {
    if (!endDateInput) return;
    const dt = new Date(endDateInput);
    if (!isNaN(dt)) {
      const idx = throughputRun.findIndex((d) => new Date(d.date) >= dt);
      if (idx === -1) {
        setEndIndex(maxIndex);
      } else {
        setEndIndex(Math.max(idx, startIndex + 1));
      }
    }
  }, [endDateInput, throughputRun, startIndex, maxIndex]);

  // Filter throughput based on selected window
  const filtered = useMemo(() => {
    if (!throughputRun.length) return [];
    return throughputRun.slice(startIndex, endIndex + 1);
  }, [throughputRun, startIndex, endIndex]);

  // Reset to full dataset
  const resetWindow = () => {
    setStartIndex(0);
    setEndIndex(maxIndex);
  };

  // Shading proportions
  const leftPercent = (startIndex / (maxIndex + 1)) * 100;
  const widthPercent = ((endIndex - startIndex + 1) / (maxIndex + 1)) * 100;

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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputRun}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>

            {/* Shaded overlay */}
            {throughputRun.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  background: "rgba(16,185,129,0.18)",
                  pointerEvents: "none"
                }}
              />
            )}
          </div>
        </section>

        {/* Date Window Controls (Option D with visible icon) */}
        <section>
          <h3>Data Window</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* START DATE */}
            <label>
              Start Date
              <div style={{ position: "relative", marginTop: "0.25rem" }}>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    paddingRight: "2.5rem",
                    fontFamily: "monospace"
                  }}
                />

                {/* Visible calendar icon */}
                <div
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#6b7280",
                    fontSize: "1.1rem"
                  }}
                >
                  📅
                </div>

                {/* Invisible native date picker */}
                <input
                  type="date"
                  value={startDate ? startDate.toISOString().slice(0, 10) : ""}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "2.5rem",
                    opacity: 0,
                    cursor: "pointer"
                  }}
                />
              </div>
            </label>

            {/* END DATE */}
            <label>
              End Date
              <div style={{ position: "relative", marginTop: "0.25rem" }}>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    paddingRight: "2.5rem",
                    fontFamily: "monospace"
                  }}
                />

                {/* Visible calendar icon */}
                <div
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#6b7280",
                    fontSize: "1.1rem"
                  }}
                >
                  📅
                </div>

                {/* Invisible native date picker */}
                <input
                  type="date"
                  value={endDate ? endDate.toISOString().slice(0, 10) : ""}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: "2.5rem",
                    opacity: 0,
                    cursor: "pointer"
                  }}
                />
              </div>
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

      {/* Mobile stacking */}
      <style>
        {`
          @media (max-width: 900px) {
            div[style*="grid-template-columns: 2fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
            div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}