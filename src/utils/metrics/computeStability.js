// src/utils/metrics/computeStability.js

import { computeArrivalRate } from "./computeArrivalRate";
import { computeThroughput } from "./computeThroughput";
import { computeWipAge } from "./computeWipAge";

export function computeStability(items, inProgressStates, today) {
  const end = new Date(today);
  const oneDay = 1000 * 60 * 60 * 24;

  const startToday = new Date(end);
  startToday.setHours(0, 0, 0, 0);

  const startLastWeek = new Date(end - 7 * oneDay);
  const startLastMonth = new Date(end - 30 * oneDay);

  return {
    today: {
      arrivalRate: computeArrivalRate(items, startToday, end),
      throughput: computeThroughput(items, startToday, end),
      wipAge: computeWipAge(items, inProgressStates, end)
    },
    lastWeek: {
      arrivalRate: computeArrivalRate(items, startLastWeek, end),
      throughput: computeThroughput(items, startLastWeek, end),
      wipAge: computeWipAge(items, inProgressStates, end)
    },
    lastMonth: {
      arrivalRate: computeArrivalRate(items, startLastMonth, end),
      throughput: computeThroughput(items, startLastMonth, end),
      wipAge: computeWipAge(items, inProgressStates, end)
    }
  };
}