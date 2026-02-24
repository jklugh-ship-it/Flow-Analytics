import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import LandingPage from "./pages/LandingPage";
import WorkflowPage from "./pages/WorkflowPage";
import Overview from "./pages/Overview";
import Forecasts from "./pages/Forecasts";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Home */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/workflow" element={<WorkflowPage />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/forecasts" element={<Forecasts />} />
		  <Route path="/privacy" element={<Privacy />} />

          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}