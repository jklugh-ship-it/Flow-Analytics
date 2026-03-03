import { parseDate } from "../date/parseDate";
import { formatDate } from "./formatDate";

export function computeThroughputRun(items) {
  if (!items || items.length === 0) return [];

  // 1. Count completions by UTC date (cycleEnd is authoritative)
  const counts = {};
  items.forEach((item) => {
    const end = parseDate(item.cycleEnd);
    if (end) {
      const iso = formatDate(end);
      counts[iso] = (counts[iso] || 0) + 1;
    }
  });

  // 2. Find earliest entry date across ALL workflow states
  const allEntryDates = [];

  items.forEach((item) => {
    if (item.entered) {
      Object.values(item.entered).forEach((d) => {
        const parsed = parseDate(d);
        if (parsed) allEntryDates.push(parsed);
      });
    }
  });

  if (allEntryDates.length === 0) return [];

  // Normalize earliest entry to UTC midnight
  allEntryDates.sort((a, b) => a - b);
  const first = allEntryDates[0];
  const firstEntry = new Date(Date.UTC(
    first.getUTCFullYear(),
    first.getUTCMonth(),
    first.getUTCDate()
  ));

  // 3. End at today (UTC midnight)
  const now = new Date();
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  // 4. Build continuous timeline with zero-fill
  const run = [];
  let cursor = new Date(firstEntry);

  while (cursor <= today) {
    const iso = formatDate(cursor);
    run.push({
      date: iso,
      count: counts[iso] || 0
    });

    cursor = new Date(Date.UTC(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth(),
      cursor.getUTCDate() + 1
    ));
  }

  return run;
}