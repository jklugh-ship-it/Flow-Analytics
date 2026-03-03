// src/layout/AppLayout.jsx

import React from "react";
import HeaderBar from "./HeaderBar";
import SideBar from "./SideBar";

export default function AppLayout({ children }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SideBar />

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          background: "#f9fafb",
          display: "flex",
          flexDirection: "column",
          minHeight: 0
        }}
      >
        <HeaderBar />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem"
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}