// src/pages/AnalyticsPage.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import Overview from "./Analytics/Overview";
import CFD from "./Analytics/CFD";
import WIP from "./Analytics/WIP";
import Throughput from "./Analytics/Throughput";
import CycleTime from "./Analytics/CycleTime";
import MonteCarlo from "./Analytics/MonteCarlo";

export default function AnalyticsPage() {
  return (
    <Routes>
      <Route path="overview" element={<Overview />} />
      <Route path="cfd" element={<CFD />} />
      <Route path="wip" element={<WIP />} />
      <Route path="throughput" element={<Throughput />} />
      <Route path="cycle" element={<CycleTime />} />
      <Route path="montecarlo" element={<MonteCarlo />} />
    </Routes>
  );
}