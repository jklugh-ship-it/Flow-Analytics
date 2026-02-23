// src/pages/Analytics/WIP.jsx

import React from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import WipRunChart from "../../components/charts/WipRunChart";

export default function WIP() {
  const wipRun = useAnalyticsStore((s) => s.metrics.wipRun);

  return (
    <div>
      <h2>WIP Run Chart</h2>
      <WipRunChart data={wipRun} />
    </div>
  );
}