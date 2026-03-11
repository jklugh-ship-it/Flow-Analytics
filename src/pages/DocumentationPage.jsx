// src/pages/DocumentationPage.jsx

import React from "react";
import { card, cardTitle } from "../styles/cards";

const REPO = "https://github.com/jklugh-ship-it/Flow-Analytics";
const DOCS_BASE = `${REPO}/blob/main/docs`;
const SECURITY_URL = `${REPO}/blob/main/SECURITY.md`;

const docs = [
  {
    title: "User Guide",
    file: "user-guide.md",
    url: `${DOCS_BASE}/user-guide.md`,
    description:
      "How to use the app end to end — defining your workflow, preparing and uploading CSV data, interpreting each chart, and running forecasts. Start here if you're new to the tool."
  },
  {
    title: "Analytics Definitions",
    file: "analytics.md",
    url: `${DOCS_BASE}/analytics.md`,
    description:
      "Precise definitions for every metric the app computes: cycle time, aging WIP, throughput, and Monte Carlo forecasting. Covers calculation rules, edge case handling, and interpretation guidance."
  },
  {
    title: "Workflow Semantics",
    file: "workflow-semantics.md",
    url: `${DOCS_BASE}/workflow-semantics.md`,
    description:
      "The state machine rules that underpin the workflow model — state types, transition rules, terminal state behavior, and how these semantics connect to analytics."
  },
  {
    title: "Data Model",
    file: "data-model.md",
    url: `${DOCS_BASE}/data-model.md`,
    description:
      "The shape of every data object in the pipeline, from raw CSV parse output through normalized items to the metrics and forecast results written to the store."
  },
  {
    title: "Architecture",
    file: "architecture.md",
    url: `${DOCS_BASE}/architecture.md`,
    description:
      "How the codebase is organized — the four layers (pages, store, analytics pipeline, simulation), key design decisions, data flow diagrams, and guidance on where to add new functionality."
  },
  {
    title: "Testing",
    file: "testing.md",
    url: `${DOCS_BASE}/testing.md`,
    description:
      "What is tested, how tests are structured, naming conventions, mocking strategy, and known gaps in coverage."
  },
  {
    title: "System Overview",
    file: "overview.md",
    url: `${DOCS_BASE}/overview.md`,
    description:
      "A high-level description of the platform's purpose, core concepts, architectural layers, data flow, system invariants, and design principles."
  }
];

const security = {
  title: "Security Model",
  url: SECURITY_URL,
  description:
    "A formal description of the application's security architecture — no-backend design, eliminated attack surfaces, automated dependency auditing on every deploy, and instructions for independent verification."
};

export default function DocumentationPage() {
  return (
    <div style={{ padding: "1.5rem", maxWidth: "860px" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Documentation</h1>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Technical and user-facing documentation for Flow Analytics. Full source
        is available in the{" "}
        <a
          href={REPO}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#2563eb" }}
        >
          GitHub repository
        </a>
        .
      </p>

      {/* Security callout */}
      <div
        style={{
          ...card,
          marginBottom: "1.5rem",
          borderLeft: "4px solid #2563eb"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <h2 style={{ ...cardTitle, marginBottom: "0.5rem" }}>
              {security.title}
            </h2>
            <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
              {security.description}
            </p>
          </div>
          <a
            href={security.url}
            target="_blank"
            rel="noreferrer"
            style={{
              flexShrink: 0,
              padding: "0.4rem 0.85rem",
              background: "#2563eb",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              whiteSpace: "nowrap"
            }}
          >
            View →
          </a>
        </div>
      </div>

      {/* Doc list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {docs.map((doc) => (
          <div key={doc.file} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div>
                <h2 style={{ ...cardTitle, marginBottom: "0.5rem" }}>
                  {doc.title}
                </h2>
                <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>
                  {doc.description}
                </p>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  flexShrink: 0,
                  padding: "0.4rem 0.85rem",
                  background: "#f3f4f6",
                  color: "#1f2937",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  border: "1px solid #e5e7eb"
                }}
              >
                View →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
