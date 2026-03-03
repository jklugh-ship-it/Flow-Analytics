// src/components/PrimaryButton.jsx

import React from "react";

const baseStyle = {
  background: "#2563eb",
  color: "white",
  padding: "0.5rem 1rem",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "40px",

  // Typography normalization
  fontSize: "0.95rem",
  fontWeight: 500,
  lineHeight: 1,
  fontFamily: "inherit",

  // Normalize browser differences
  appearance: "none",
  WebkitAppearance: "none",
};

export default function PrimaryButton({ children, style = {}, ...props }) {
  return (
    <button {...props} style={{ ...baseStyle, ...style }}>
      {children}
    </button>
  );
}