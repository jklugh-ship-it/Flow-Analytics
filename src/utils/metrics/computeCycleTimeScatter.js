// src/utils/metrics/computeCycleTimeScatter.js

import { daysBetween } from "../date/daysBetween";
import { formatDate } from "./formatDate";

export function computeCycleTimeScatter(items) {
  if (!items || items.length === 0) return [];

  return items
    .map((i) => {
      const start = i.cycleStart;
      const end = i.cycleEnd;

      if (!start || !end) return null;

      const ct = daysBetween(start, end);
      const safeCt = Math.max(ct, 1);

      return {
        date: formatDate(end), // x-axis = completion date
        value: safeCt          // y-axis = cycle time
      };
    })
    .filter(Boolean);
}