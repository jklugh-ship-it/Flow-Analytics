// src/hooks/useMonteCarloWhenHowLong.js

import { useCallback } from "react";
import { simulateDuration } from "../utils/simulateDuration";

function isMostlyZeros(arr) {
  if (!arr || arr.length === 0) return false;
  const nonZero = arr.filter(n => n > 0).length;
  return nonZero / arr.length < 0.2;
}

export default function useMonteCarloWhenHowLong({
  throughputWindow,
  fullThroughput,
  targetCount,
  numSimulations,
  setResults,
  setPercentiles,
  setFallbackUsed,
  setZeroWarning // <-- NEW: pass this from the panel
}) {
  return useCallback(() => {
    const windowData = Array.isArray(throughputWindow)
      ? throughputWindow.map(d => d.count)
      : [];

    const fullData = fullThroughput.map(d => d.count);

    // Use window unless it's literally empty
    const useWindow = windowData.length > 0 ? windowData : fullData;

    setFallbackUsed(windowData.length === 0);

    // NEW: warn if mostly zeros
    setZeroWarning(isMostlyZeros(useWindow));

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
    setZeroWarning
  ]);
}
