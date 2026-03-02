// src/utils/metrics/computeCfd.js

import { eachDay } from "./eachDay";
import { formatDate } from "./formatDate";

export function computeCfd(items, workflowStates) {
  if (!items || items.length === 0) return [];

  // Collect all dates that matter for the CFD timeline
  const allDates = [];

  items.forEach((item) => {
    if (item.created instanceof Date) allDates.push(item.created);
    if (item.completed instanceof Date) allDates.push(item.completed);

    workflowStates.forEach((state) => {
      const d =
        item.entered?.[`entered_${state}`] ??
        item.entered?.[state];

      if (d instanceof Date) allDates.push(d);
    });
  });

  if (allDates.length === 0) return [];

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  const days = eachDay(minDate, maxDate);

  // Build CFD rows
  return days.map((day) => {
    const row = { date: formatDate(day) };

    workflowStates.forEach((state) => {
      const count = items.filter((item) => {
        const d =
          item.entered?.[`entered_${state}`] ??
          item.entered?.[state];

        return d instanceof Date && d <= day;
      }).length;

      row[state] = count;
    });

    return row;
  });
}