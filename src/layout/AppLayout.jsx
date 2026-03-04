// src/layout/AppLayout.jsx

import React, { useState, useCallback } from "react";
import HeaderBar from "./HeaderBar";
import SideBar from "./SideBar";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SideBar open={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          background: "#f9fafb",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0
        }}
      >
        <HeaderBar onMenuClick={() => setSidebarOpen((o) => !o)} />

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
