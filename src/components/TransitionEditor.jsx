// src/components/TransitionEditor.jsx

import React from "react";
import { formatDate as fmt } from "../utils/metrics";

export default function TransitionEditor({ items, workflowStates }) {
  if (!items.length) return null;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <h2>Transition Overview</h2>
      <p style={{ fontSize: "0.9rem" }}>
        Shows created, completed, and transition dates. Asterisk (*) indicates an inferred date.
      </p>

      <div style={{ maxHeight: "250px", overflow: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: "0.85rem"
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "4px" }}>ID</th>
              <th style={{ border: "1px solid #ccc", padding: "4px" }}>Title</th>
              <th style={{ border: "1px solid #ccc", padding: "4px" }}>Created</th>
              <th style={{ border: "1px solid #ccc", padding: "4px" }}>Completed</th>
              {workflowStates.map((s) => (
                <th key={s} style={{ border: "1px solid #ccc", padding: "4px" }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id || i.title}>
                <td style={{ border: "1px solid #ccc", padding: "4px" }}>{i.id}</td>
                <td style={{ border: "1px solid #ccc", padding: "4px" }}>{i.title}</td>
                <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                  {i.created ? fmt(i.created) : ""}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                  {i.completed ? fmt(i.completed) : ""}
                </td>
                {workflowStates.map((s) => (
                  <td key={s} style={{ border: "1px solid #ccc", padding: "4px" }}>
                    {i.transitions[s]
                      ? fmt(i.transitions[s]) + (i.inferred[s] ? "*" : "")
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: "0.8rem", marginTop: "4px" }}>
        <em>* inferred</em>
      </p>
    </div>
  );
}