import { parseDate } from "../date/parseDate";

export function computeCycleTimeDays(item) {
  const start = parseDate(item.cycleStart);
  const end = parseDate(item.cycleEnd);

  if (!start || !end) return null;

  const ms = end.getTime() - start.getTime();

  // Inclusive cycle time: end - start + 1
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}
