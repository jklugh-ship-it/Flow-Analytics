export default function useMonteCarloWhenHowLong({
  throughputHistory,
  workflowStates,
  targetCount,
  numSimulations,
  setResults,
  setPercentiles
}) {
  return () => {
    if (!throughputHistory?.length) return;

    const sims = [];

    for (let i = 0; i < numSimulations; i++) {
      let total = 0;
      let days = 0;

      while (total < targetCount) {
        const idx = Math.floor(Math.random() * throughputHistory.length);
        total += throughputHistory[idx];
        days++;
      }

      sims.push(days);
    }

    sims.sort((a, b) => a - b);

    const pct = {
      p50: sims[Math.floor(numSimulations * 0.5)],
      p85: sims[Math.floor(numSimulations * 0.85)],
      p95: sims[Math.floor(numSimulations * 0.95)]
    };

    setResults(sims);
    setPercentiles(pct);
  };
}