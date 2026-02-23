import React from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  annotationPlugin
);

export default function MonteCarloHistogram({ data, percentiles, xLabel }) {
  if (!data || !data.length) return null;

  // Convert raw results into frequency buckets
  const freq = {};
  data.forEach((v) => {
    freq[v] = (freq[v] || 0) + 1;
  });

  const labels = Object.keys(freq)
    .map((k) => Number(k))
    .sort((a, b) => a - b);

  const counts = labels.map((k) => freq[k]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Frequency",
        data: counts,
        backgroundColor: "rgba(75, 192, 192, 0.6)"
      }
    ]
  };

  // Helper: find the index of a percentile value in the labels array
  const findIndexForValue = (value) =>
    labels.findIndex((label) => Number(label) === Number(value));

  // Build annotation lines
  const annotations = {};

  if (percentiles?.p50 !== undefined) {
    const idx = findIndexForValue(percentiles.p50);
    if (idx !== -1) {
      annotations.p50 = {
        type: "line",
        xMin: idx,
        xMax: idx,
        borderColor: "#10b981",
        borderWidth: 2,
        label: {
          content: `P50 (${percentiles.p50})`,
          enabled: true,
          position: "start"
        }
      };
    }
  }

  if (percentiles?.p85 !== undefined) {
    const idx = findIndexForValue(percentiles.p85);
    if (idx !== -1) {
      annotations.p85 = {
        type: "line",
        xMin: idx,
        xMax: idx,
        borderColor: "#f59e0b",
        borderWidth: 2,
        label: {
          content: `P85 (${percentiles.p85})`,
          enabled: true,
          position: "start"
        }
      };
    }
  }

  if (percentiles?.p95 !== undefined) {
    const idx = findIndexForValue(percentiles.p95);
    if (idx !== -1) {
      annotations.p95 = {
        type: "line",
        xMin: idx,
        xMax: idx,
        borderColor: "#ef4444",
        borderWidth: 2,
        label: {
          content: `P95 (${percentiles.p95})`,
          enabled: true,
          position: "start"
        }
      };
    }
  }

  const options = {
    scales: {
      x: {
        title: { display: true, text: xLabel || "Value" }
      },
      y: {
        title: { display: true, text: "Frequency" }
      }
    },
    plugins: {
      annotation: {
        annotations
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}