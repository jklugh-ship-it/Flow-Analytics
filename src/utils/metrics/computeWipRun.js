// src/utils/metrics/computeWipRun.js

import { eachDay } from "./eachDay";
import { formatDate } from "./formatDate";

export function computeWipRun(items) {
  if (!items || items.length === 0) return [];

  const allDates = [];

  items.forEach((item) => {
    if (item.created instanceof Date) {
      const d = new Date(item.created);
      d.setHours(0, 0, 0, 0);
      allDates.push(d);
    }
    if (item.cycleEnd instanceof Date) {
      const d = new Date(item.cycleEnd);
      d.setHours(0, 0, 0, 0);
      allDates.push(d);
    }
  });

  if (allDates.length === 0) return [];

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  minDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = eachDay(minDate, today);

  return days.map((day) => {
    const count = items.filter((item) => {
      if (!(item.created instanceof Date)) return false;

      const start = new Date(item.created);
      start.setHours(0, 0, 0, 0);

      let end = null;
      if (item.cycleEnd instanceof Date) {
        end = new Date(item.cycleEnd);
        end.setHours(0, 0, 0, 0);
      }

      return start <= day && (!end || end > day);
    }).length;

    return { date: formatDate(day), count };
  });
}