// src/utils/simulateHowMany.js

export function simulateHowMany({
  throughputSamples,   // array of daily throughput values (window or fallback)
  days,                // number of calendar days in the forecast horizon
  numSimulations       // number of Monte Carlo runs
}) {
  if (!Array.isArray(throughputSamples) || throughputSamples.length === 0) {
    return { p05: 0, p15: 0, p50: 0, sims: [] };
  }

  const sims = [];

  for (let i = 0; i < numSimulations; i++) {
    let total = 0;

    // Correct: simulate exactly "days" days, not throughputSamples.length
    for (let d = 0; d < days; d++) {
      const sample =
        throughputSamples[Math.floor(Math.random() * throughputSamples.length)];
      total += sample;
    }

    sims.push(total);
  }

  sims.sort((a, b) => a - b);

  const pct = (p) => {
    const idx = Math.floor((p / 100) * sims.length);
    return sims[Math.min(Math.max(idx, 0), sims.length - 1)];
  };

  return {
    p05: pct(5),
    p15: pct(15),
    p50: pct(50),
    sims
  };
}