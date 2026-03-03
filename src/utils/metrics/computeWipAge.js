// src/utils/metrics/computeWipAge.js

export function computeWipAge(items, inProgressStates, today) {
  const now = new Date(today);

  const ages = items
    // WIP = no cycleEnd
    .filter((item) => item.cycleEnd === null)
    .map((item) => {
      // Collect all in-progress entry dates
      const dates = inProgressStates
        .map((state) => item[`entered_${state}`])
        .filter((d) => d instanceof Date);

      if (dates.length === 0) return null;

      // Earliest in-progress date
      const start = new Date(Math.min(...dates.map((d) => d.getTime())));

      const ageDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      return ageDays;
    })
    .filter((x) => x !== null);

  if (ages.length === 0) return 0;

  return Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
}