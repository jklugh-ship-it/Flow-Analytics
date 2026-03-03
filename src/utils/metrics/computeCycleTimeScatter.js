import { parseDate } from "../date/parseDate";
import { daysBetween } from "../date/daysBetween";
import { formatDate } from "./formatDate";

export function computeCycleTimeScatter(items) {
  if (!items || items.length === 0) return [];

  const points = [];

  items.forEach((i) => {
    const rawStart = i.cycleStart;
    const rawEnd = i.cycleEnd;

    if (!rawStart || !rawEnd) return;

    const start = parseDate(rawStart);
    const end = parseDate(rawEnd);

    if (!start || !end) return;

    const ct = daysBetween(start, end);
    if (ct == null || Number.isNaN(ct)) return;

    points.push({
      date: formatDate(end),
      value: ct
    });
  });

  return points;
}