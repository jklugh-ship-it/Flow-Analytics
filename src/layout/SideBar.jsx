import React from "react";
import { NavLink } from "react-router-dom";

export default function SideBar() {
  return (
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
        {/* Home + Workflow */}
        <SidebarLink to="/">Home</SidebarLink>
        <SidebarLink to="/workflow">Workflow Designer</SidebarLink>

        {/* Overview */}
        <SidebarLink to="/overview">Overview</SidebarLink>

        {/* Indented chart pages */}
        <SidebarLink to="/charts/cfd" indent>
          Cumulative Flow Diagram
        </SidebarLink>
        <SidebarLink to="/charts/wip" indent>
          Work in Progress
        </SidebarLink>
        <SidebarLink to="/charts/throughput" indent>
          Throughput
        </SidebarLink>
        <SidebarLink to="/charts/cycle-time" indent>
          Cycle Time
        </SidebarLink>
        <SidebarLink to="/forecasts" indent>
		  Forecasts
		</SidebarLink>

        {/* Privacy */}
        <SidebarLink to="/privacy">Privacy</SidebarLink>
      </nav>
    </aside>
  );
}

function SidebarLink({ to, children, indent = false }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "0.5rem 0.75rem",
        paddingLeft: indent ? "1.75rem" : "0.75rem",
        borderRadius: "6px",
        textDecoration: "none",
        color: isActive ? "#1f2937" : "white",
        background: isActive ? "white" : "transparent",
        fontWeight: isActive ? "600" : indent ? "300" : "400",
        fontSize: indent ? "0.9rem" : "1rem",
        opacity: indent ? 0.9 : 1
      })}
    >
      {children}
    </NavLink>
  );
}