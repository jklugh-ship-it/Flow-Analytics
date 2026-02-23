// src/components/charts/ThroughputPreviewChart.jsx

import React from "react";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function ThroughputPreviewChart({ data }) {
  if (!data || !data.length) return null;

  const labels = data.map((d) => d.date);
  const counts = data.map((d) => d.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Throughput",
        data: counts,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.3)",
        tension: 0.2
      }
    ]
  };

  const options = {
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Items Completed" } }
    }
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3>Throughput Preview</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}