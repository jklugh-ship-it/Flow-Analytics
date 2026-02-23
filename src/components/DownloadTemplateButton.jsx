import React from "react";
import { generateCsvTemplate } from "../utils/csvTemplate";

export default function DownloadTemplateButton({ workflowStates }) {
  const handleDownload = () => {
    const csv = generateCsvTemplate(workflowStates);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "workflow_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleDownload} style={{ marginTop: "1rem" }}>
      Download CSV Template
    </button>
  );
}