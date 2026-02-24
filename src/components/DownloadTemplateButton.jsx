// src/components/DownloadTemplateButton.jsx

import React from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";

export default function DownloadTemplateButton() {
  const workflowStates = useAnalyticsStore((s) => s.workflowStates);

  const handleDownload = () => {
    if (!workflowStates || workflowStates.length === 0) {
      alert("Please define workflow states before downloading a template.");
      return;
    }

    // New header: id,title,entered_<State1>,...,entered_<StateN>
    const header = [
      "id",
      "title",
      ...workflowStates.map((s) => `entered_${s}`)
    ];

    // Example row
    const exampleRow = [
      "1234",
      "Example work item",
      ...workflowStates.map(() => "")
    ];

    const csvContent =
      header.join(",") + "\n" + exampleRow.join(",");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "workflow_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleDownload}>
      Download CSV Template
    </button>
  );
}