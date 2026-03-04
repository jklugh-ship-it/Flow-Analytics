// src/layout/SideBar.jsx

import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const SIDEBAR_WIDTH = "240px";

export default function SideBar({ open, onClose }) {
  const location = useLocation();

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay — tap outside to close */}
      {open && (
        <div
          onClick={onClose}
          style={{
            display: "none",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        className="sidebar"
        style={{
          width: SIDEBAR_WIDTH,
          background: "#1f2937",
          color: "white",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          flexShrink: 0
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
          <SidebarLink to="/">Home</SidebarLink>
          <SidebarLink to="/workflow">Workflow Designer</SidebarLink>
          <SidebarLink to="/overview">Overview</SidebarLink>
          <SidebarLink to="/charts/cfd" indent>Cumulative Flow Diagram</SidebarLink>
          <SidebarLink to="/charts/wip" indent>Work in Progress</SidebarLink>
          <SidebarLink to="/charts/throughput" indent>Throughput</SidebarLink>
          <SidebarLink to="/charts/cycle-time" indent>Cycle Time</SidebarLink>
          <SidebarLink to="/forecasts" indent>Forecasts</SidebarLink>
          <SidebarLink to="/privacy">Privacy</SidebarLink>
        </nav>
      </aside>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 50;
            transform: ${open ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH})`};
            transition: transform 0.25s ease;
          }
          .sidebar-overlay {
            display: block !important;
          }
        }
      `}</style>
    </>
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
