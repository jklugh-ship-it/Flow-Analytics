import React from "react";

export default function WorkflowFlowGraphic({
  workflowStates,
  workflowVisibility,
  inProgressStates
}) {
  if (!workflowStates || workflowStates.length === 0) return null;

const getColor = (state, index) => {
  const isLastState = index === workflowStates.length - 1;

  // Invisible → greyed out
  if (!workflowVisibility[state]) {
    return { fill: "#d1d5db", text: "#6b7280", opacity: 0.4 };
  }

  // Last state is ALWAYS blue (terminal)
  if (isLastState) {
    return { fill: "#3b82f6", text: "#1e3a8a", opacity: 1 };
  }

  // In-progress → green
  if (inProgressStates[state]) {
    return { fill: "#10b981", text: "#064e3b", opacity: 1 };
  }

  // Everything else → blue (open or post-progress)
  return { fill: "#3b82f6", text: "#1e3a8a", opacity: 1 };
};


  const isFirst = (i) => i === 0;
  const isLast = (i) => i === workflowStates.length - 1;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
      {workflowStates.map((state, i) => {
        const { fill, text, opacity } = getColor(state, i);

        const shape = isFirst(i) || isLast(i) ? (
          // Oval terminator
          <svg width="120" height="40">
            <ellipse
              cx="60"
              cy="20"
              rx="55"
              ry="18"
              fill={fill}
              opacity={opacity}
              stroke="#374151"
            />
            <text
              x="60"
              y="25"
              textAnchor="middle"
              fill={text}
              style={{ fontWeight: 600 }}
            >
              {state}
            </text>
          </svg>
        ) : (
          // Rounded rectangle
          <svg width="140" height="40">
            <rect
              x="5"
              y="5"
              width="130"
              height="30"
              rx="8"
              ry="8"
              fill={fill}
              opacity={opacity}
              stroke="#374151"
            />
            <text
              x="70"
              y="25"
              textAnchor="middle"
              fill={text}
              style={{ fontWeight: 600 }}
            >
              {state}
            </text>
          </svg>
        );

        return (
          <React.Fragment key={state}>
            {shape}
            {!isLast(i) && (
              <span style={{ fontSize: "1.5rem", color: "#6b7280" }}>→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}