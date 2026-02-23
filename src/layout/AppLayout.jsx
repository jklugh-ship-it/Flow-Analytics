// src/layout/AppLayout.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import HeaderBar from "./HeaderBar";

export default function AppLayout({ children }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: "#1f2937",
          color: "white",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.4rem" }}>Flow Analytics</h2>

        <nav
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}
        >
          {/* Keep Home + Workflow */}
          <SidebarLink to="/">Home</SidebarLink>
          <SidebarLink to="/workflow">Workflow Designer</SidebarLink>

          {/* NEW simplified analytics navigation */}
          <SidebarLink to="/overview">Overview</SidebarLink>
          <SidebarLink to="/forecasts">Forecasts</SidebarLink>
        </nav>
      </aside>

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

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "0.5rem 0.75rem",
        borderRadius: "6px",
        textDecoration: "none",
        color: isActive ? "#1f2937" : "white",
        background: isActive ? "white" : "transparent",
        fontWeight: isActive ? "600" : "400"
      })}
    >
      {children}
    </NavLink>
  );
}