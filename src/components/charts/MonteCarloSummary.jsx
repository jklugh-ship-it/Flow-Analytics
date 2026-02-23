// src/components/charts/MonteCarloSummary.jsx

import React, { useState, useEffect, useRef } from "react";
import MonteCarloHistogram from "./MonteCarloHistogram";
import ThroughputPreviewChart from "./ThroughputPreviewChart";

export default function MonteCarloSummary({ throughputRun }) {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-02-01");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const workerRef = useRef(null);

  // Initialize worker once
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../workers/monteCarloWorker.js", import.meta.url)
    );

    workerRef.current.onmessage = (e) => {
      setResults(e.data);
      setLoading(false);
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const runSimulation = () => {
    if (!throughputRun.length) return;

    const dailyCounts = throughputRun.map((d) => d.count);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const horizonDays = Math.max(
      0,
      Math.floor((end - start) / (1000 * 60 * 60 * 24))
    );
	
		console.log("dailyCounts", dailyCounts);
console.log("horizonDays", horizonDays);

    setLoading(true);

    workerRef.current.postMessage({
      dailyCounts,
      horizonDays,
      trials: 5000
    });
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Monte Carlo: How Many</h2>
		<ThroughputPreviewChart data={throughputRun} />

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label>Start Date</label>
          <br />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>End Date</label>
          <br />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button onClick={runSimulation} style={{ height: "40px" }}>
          Run Simulation
        </button>
      </div>

      {loading && <p>Running simulation…</p>}

      {results && !loading && (
        <>
          <h3>Summary</h3>
          <ul>
            <li>P50: {results.summary.p50}</li>
            <li>P85: {results.summary.p85}</li>
            <li>P95: {results.summary.p95}</li>
          </ul>

          <h3>Distribution Histogram</h3>
          <MonteCarloHistogram data={results.histogram} />
        </>
      )}
    </div>
  );
}