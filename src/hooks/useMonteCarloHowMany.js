// src/hooks/useMonteCarloHowMany.js

import { useCallback } from "react";
import { simulateHowMany } from "../utils/simulateHowMany";

export default function useMonteCarloHowMany({
  throughputWindow,
  fullThroughput,
  days,
  numSimulations,
  setResults,
  setPercentiles,
  setFallbackUsed
}) {
  return useCallback(() => {
    // Convert to arrays of counts (including zeros)
    const windowData = Array.isArray(throughputWindow)
      ? throughputWindow.map(d => d.count)
      : [];

    const fullData = fullThroughput.map(d => d.count);

    // NEW: only fall back if the window is literally empty
    const useWindow = windowData.length > 0 ? windowData : fullData;

    setFallbackUsed(windowData.length === 0);

    // If still no usable data, return empty results
    if (useWindow.length === 0) {
      setResults([]);
      setPercentiles({ p05: null, p15: null, p50: null });
      return;
    }

    // Run simulation
    const { p05, p15, p50, sims } = simulateHowMany({
      throughputSamples: useWindow,
      days,
      numSimulations
    });

    setResults(sims);
    setPercentiles({ p05, p15, p50 });
  }, [
    throughputWindow,
    fullThroughput,
    days,
    numSimulations,
    setResults,
    setPercentiles,
    setFallbackUsed
  ]);
}
