// src/hooks/useMonteCarloWhenHowLong.js

import { useCallback } from "react";
import { simulateDuration } from "../utils/simulateDuration";

export default function useMonteCarloWhenHowLong({
  throughputWindow,
  fullThroughput,
  targetCount,
  numSimulations,
  setResults,
  setPercentiles,
  setFallbackUsed,
}) {
  return useCallback(() => {
    const windowData = Array.isArray(throughputWindow)
      ? throughputWindow.map(d => d.count)
      : [];

    const fullData = fullThroughput.map(d => d.count);

    // Use window unless it's literally empty
    const useWindow = windowData.length > 0 ? windowData : fullData;

    setFallbackUsed(windowData.length === 0);

    if (useWindow.length === 0) {
      setResults([]);
      setPercentiles({ p50: null, p85: null, p95: null });
      return;
    }

    const { p50, p85, p95, sims } = simulateDuration({
      throughputSamples: useWindow,
      targetCount,
      numSimulations
    });

    setResults(sims);
    setPercentiles({ p50, p85, p95 });
  }, [
    throughputWindow,
    fullThroughput,
    targetCount,
    numSimulations,
    setResults,
    setPercentiles,
    setFallbackUsed,
  ]);
}
