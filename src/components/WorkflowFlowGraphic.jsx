import React from "react";
import "./WorkflowFlowGraphic.css";

export default function WorkflowFlowGraphic({
  workflowStates,
  workflowVisibility,
  inProgressStates
}) {
  if (!workflowStates || workflowStates.length === 0) return null;

  const getColor = (state, index) => {
    const isLast = index === workflowStates.length - 1;

    if (!workflowVisibility[state]) {
      return { bg: "#d1d5db", text: "#6b7280", opacity: 0.4 };
    }

    if (isLast) {
      return { bg: "#3b82f6", text: "#1e3a8a", opacity: 1 };
    }

    if (inProgressStates[state]) {
      return { bg: "#10b981", text: "#064e3b", opacity: 1 };
    }

    return { bg: "#3b82f6", text: "#1e3a8a", opacity: 1 };
  };

  return (
    <div className="workflow">
      {workflowStates.map((state, i) => {
        const { bg, text, opacity } = getColor(state, i);

        return (
          <React.Fragment key={state}>
            <div
              className="workflow-state"
              style={{
                backgroundColor: bg,
                color: text,
                opacity
              }}
            >
              {state}
            </div>

            {i < workflowStates.length - 1 && (
              <svg
                className="workflow-arrow"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M4 12h14m-6-6l6 6-6 6"
                  stroke="#6b7280"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}