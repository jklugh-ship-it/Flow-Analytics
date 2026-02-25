// src/pages/LandingPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { triggerHeaderCsvUpload } from "../layout/HeaderBar";

export default function LandingPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>Welcome to Flow Analytics</h1>

      {/* 3‑Panel Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem"
        }}
      >
        {/* Panel 1 — What Flow Analytics Are */}
        <section
          style={{
            padding: "1.5rem",
            borderRadius: "8px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb"
          }}
        >
          <h2>What Are Flow Analytics?</h2>
          <p>
            Flow analytics help teams understand how work actually moves through
            their system. Instead of relying on intuition, flow metrics reveal
            the patterns that shape delivery.
          </p>

          <ul>
            <li><strong>Work in Progress (WIP)</strong> — how much work is active</li>
            <li><strong>Cycle Time</strong> — how long work is "in progress"</li>
            <li><strong>Work Item Age</strong> — how long an item has been in the workflow</li>
            <li><strong>Throughput</strong> — how much work your team finishes in a given time</li>
          </ul>

          <p>
            Used well, these metrics help teams forecast with confidence, spot
            risks early, reduce overcommitment, and improve flow stability.
          </p>
        </section>

        {/* Panel 2 — How to Use This Application */}
        <section
          style={{
            padding: "1.5rem",
            borderRadius: "8px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb"
          }}
        >
          <h2>How to Use This Application</h2>
          <p>
            Everything runs entirely in your browser. No uploads. No storage. No
            transmission. Your data stays with you.
          </p>

          <ol>
            <li>
              <strong><Link to="/workflow">Define Your Workflow</Link></strong>
              <br />Use the Workflow Designer to describe the states work moves through.
            </li>

            <li>
              <strong>
                <span
                  style={{
                    color: "#2563eb",
                    cursor: "pointer",
                    textDecoration: "underline"
                  }}
                  onClick={triggerHeaderCsvUpload}
                >
                  Upload Your Data
                </span>
              </strong>
              <br />Provide a CSV of your historical work items and transition dates.
            </li>

            <li>
              <strong><Link to="/overview"> Explore Your Data</Link></strong>
              <br />View work in progress, cycle time, work item age, throughput, and more for insights into your system's health.
            </li>

            <li>
              <strong><Link to="/forecast">Run Forecasts</Link></strong>
              <br />Use Monte Carlo simulations to answer “How many by when?” and “When will we finish?”.
            </li>
          </ol>
        </section>

        {/* Panel 3 — Learn More */}
        <section
          style={{
            padding: "1.5rem",
            borderRadius: "8px",
            background: "#f9fafb",
            border: "1px solid #e5e7eb"
          }}
        >
          <h2>Learn More About Flow Metrics</h2>
          <p>
            If you want to go deeper into the ideas behind this tool, these
            resources are a great place to start:
          </p>

          <ul>
            <li>
              <strong>Flow Metrics for Scrum Teams</strong>
              <br />A practical introduction to throughput, cycle time, WIP, and forecasting.
              <br />
              <a
                href="https://www.prokanban.org/scrum-flow-metrics"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit prokanban.org for the PDF
              </a>
            </li>

            <li>
              <strong>Scrum.org's Kanban Guide for Scrum Teams</strong>
              <br />This guide discusses how flow thinking complements Scrum and improves visualization.
              <br />
              <a
                href="https://www.scrum.org/resources/kanban-guide-scrum-teams"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit scrum.org for the guide
              </a>
            </li>

            <li>
              <strong>Actionable Agile™ Blog & Videos</strong>
              Real‑world examples of flow metrics and forecasting.
            </li>

            <li>
              <strong>The Principles of Product Development Flow</strong>
              A deeper exploration of queues, variability, and flow efficiency.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}