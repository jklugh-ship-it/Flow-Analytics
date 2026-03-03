// src/utils/metrics/computeWipRun.js

import { parseDate } from "../date/parseDate";
import { formatDate } from "./formatDate";
import { eachDay } from "./eachDay";

export function computeWipRun(items) {
  if (!items || items.length === 0) return [];

  const allDates = [];

  // Collect all relevant dates (cycleStart, cycleEnd)
  items.forEach((item) => {
    const start = parseDate(item.cycleStart);
    const end = parseDate(item.cycleEnd);

    if (start) allDates.push(start);
    if (end) allDates.push(end);
  });

  if (allDates.length === 0) return [];

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const today = new Date();

  const days = eachDay(minDate, today);

  return days.map((day) => {
    const count = items.filter((item) => {
      const start = parseDate(item.cycleStart);
      const end = parseDate(item.cycleEnd);

      return (
        start &&
        start <= day &&
        (!end || end > day)
      );
    }).length;

    return { date: formatDate(day), count };
  });
}