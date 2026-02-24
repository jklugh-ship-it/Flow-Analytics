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
    const windowData = Array.isArray(throughputWindow)
  ? throughputWindow.map(d => d.count)
  : [];


    const fullData = fullThroughput.map(d => d.count);

const useWindow =
  windowData.length >= 5 ? windowData : fullData;


    setFallbackUsed(windowData.length < 5);

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