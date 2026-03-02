// src/utils/metrics/computeThroughputRun.js

export function computeThroughputRun(items) {
  if (!items || items.length === 0) return [];

  // 1. Count completions by UTC date (cycleEnd is authoritative)
  const counts = {};
  items.forEach((item) => {
    const end = item.cycleEnd;
    if (end instanceof Date) {
      const iso = end.toISOString().slice(0, 10);
      counts[iso] = (counts[iso] || 0) + 1;
    }
  });

  // 2. Find earliest entry date across ALL workflow states
  const allEntryDates = [];

  items.forEach((item) => {
    if (item.entered) {
      Object.values(item.entered).forEach((d) => {
        if (d instanceof Date) allEntryDates.push(d);
      });
    }
  });

  if (allEntryDates.length === 0) return [];

  // Normalize earliest entry to UTC midnight
  const first = allEntryDates[0];
  const firstEntry = new Date(
    Date.UTC(
      first.getUTCFullYear(),
      first.getUTCMonth(),
      first.getUTCDate()
    )
  );

  // 3. End at today (UTC midnight)
  const now = new Date();
  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  // 4. Build continuous timeline with zero-fill
  const run = [];
  let cursor = new Date(firstEntry);

  while (cursor <= today) {
    const iso = cursor.toISOString().slice(0, 10);
    run.push({
      date: iso,
      count: counts[iso] || 0
    });

    cursor = new Date(
      Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() + 1
      )
    );
  }

  return run;
}