// src/utils/simulateDuration.js

export function simulateDuration({
  throughputSamples,   // array of daily throughput values (window or fallback)
  targetCount,         // how many items we need to finish
  numSimulations       // number of Monte Carlo runs
}) {
  if (!Array.isArray(throughputSamples) || throughputSamples.length === 0) {
    return { p50: 0, p85: 0, p95: 0, sims: [] };
  }

  const sims = [];

  for (let i = 0; i < numSimulations; i++) {
    let total = 0;
    let days = 0;

    // Keep sampling until we hit the target
    while (total < targetCount) {
      const sample =
        throughputSamples[Math.floor(Math.random() * throughputSamples.length)];
      total += sample;
      days++;
    }

    sims.push(days);
  }

  sims.sort((a, b) => a - b);

  const pct = (p) => {
    const idx = Math.floor((p / 100) * sims.length);
    return sims[Math.min(Math.max(idx, 0), sims.length - 1)];
  };

  return {
    p50: pct(50),
    p85: pct(85),
    p95: pct(95),
    sims
  };
}