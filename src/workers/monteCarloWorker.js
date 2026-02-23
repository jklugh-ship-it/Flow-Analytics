// src/workers/monteCarloWorker.js

// IMPORTANT: Workers cannot use imports from React code.
// Everything must be self-contained.

function runMonteCarlo(dailyCounts, horizonDays, trials) {
  const results = [];

  for (let t = 0; t < trials; t++) {
    let total = 0;

    for (let d = 0; d < horizonDays; d++) {
      const idx = Math.floor(Math.random() * dailyCounts.length);
      total += dailyCounts[idx];
    }

    results.push(total);
  }

  results.sort((a, b) => a - b);

  const percentile = (p) =>
    results[Math.floor((p / 100) * results.length)];

  // Build histogram
  const histogram = {};
  results.forEach((value) => {
    histogram[value] = (histogram[value] || 0) + 1;
  });

  const histogramArray = Object.entries(histogram).map(
    ([value, count]) => ({
      value: Number(value),
      count
    })
  );

  return {
    distribution: results,
    summary: {
      p50: percentile(50),
      p85: percentile(85),
      p95: percentile(95)
    },
    histogram: histogramArray
  };
}

onmessage = function (e) {
  const { dailyCounts, horizonDays, trials } = e.data;

  const output = runMonteCarlo(dailyCounts, horizonDays, trials);

  postMessage(output);
};