import { daysBetween } from "../date/daysBetween";
import { parseDate } from "../date/parseDate";

export function computeCycleTimeHistogram(items) {
  if (!items || items.length === 0) return [];

  const buckets = {};

  items.forEach((i) => {
    const rawStart = i.cycleStart;
    const rawEnd = i.cycleEnd;

    if (!rawStart || !rawEnd) return;

    const start = parseDate(rawStart);
    const end = parseDate(rawEnd);

    if (!start || !end) return;

    const ct = daysBetween(start, end);
    if (ct == null || Number.isNaN(ct)) return;

    const safeCt = Math.max(ct, 1);
    buckets[safeCt] = (buckets[safeCt] || 0) + 1;
  });

  return Object.entries(buckets).map(([value, count]) => ({
    value: Number(value),
    count
  }));
}