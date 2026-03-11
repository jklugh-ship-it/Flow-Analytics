import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import LandingPage from "./pages/LandingPage";
import WorkflowPage from "./pages/WorkflowPage";
import Overview from "./pages/Overview";
import Forecasts from "./pages/Forecasts";
import Privacy from "./pages/Privacy";
import DocumentationPage from "./pages/DocumentationPage";
import CfdPage from "./pages/charts/CfdPage";
import WipPage from "./pages/charts/WipPage";
import ThroughputPage from "./pages/charts/ThroughputPage";
import CycleTimePage from "./pages/charts/CycleTimePage";
import MonteCarloPage from "./pages/charts/MonteCarloPage";

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Home */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/workflow" element={<WorkflowPage />} />
          <Route path="/overview" element={<Overview />} />
		  <Route path="/charts/cfd" element={<CfdPage />} />
		  <Route path="/charts/wip" element={<WipPage />} />
		  <Route path="/charts/throughput" element={<ThroughputPage />} />
		  <Route path="/charts/cycle-time" element={<CycleTimePage />} />
		  <Route path="/charts/monte-carlo" element={<MonteCarloPage />} />
          <Route path="/forecasts" element={<Forecasts />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/documentation" element={<DocumentationPage />} />

          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}