export default function useMonteCarloHowMany({
  throughputHistory,
  days,
  simCount,
  setResults,
  setPercentiles
}) {
  return () => {
    if (!throughputHistory?.length || days <= 0) {
      setResults([]);
      setPercentiles({ p05: null, p15: null, p50: null });
      return;
    }

    const sims = [];

    for (let i = 0; i < simCount; i++) {
      let total = 0;

      for (let d = 0; d < days; d++) {
        const idx = Math.floor(Math.random() * throughputHistory.length);
        total += throughputHistory[idx];
      }

      sims.push(total);
    }

    sims.sort((a, b) => a - b);

    const pct = {
      p05: sims[Math.floor(simCount * 0.05)],
      p15: sims[Math.floor(simCount * 0.15)],
      p50: sims[Math.floor(simCount * 0.5)]
    };

    setResults(sims);
    setPercentiles(pct);
  };
}