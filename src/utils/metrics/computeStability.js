// src/utils/metrics/computeStability.js

import { computeArrivalRate } from "./computeArrivalRate";
import { computeThroughput } from "./computeThroughput";
import { computeHistoricalWipAge } from "./computeHistoricalWipAge";

export function computeStability(items, inProgressStates, today, workflowStates = []) {
  const end = new Date(today);
  const oneDay = 1000 * 60 * 60 * 24;

  const startToday = new Date(end);
  startToday.setHours(0, 0, 0, 0);

  const startLastWeek = new Date(end - 7 * oneDay);
  const startLastMonth = new Date(end - 30 * oneDay);

  const firstInProgressState = inProgressStates[0] ?? workflowStates[0];
  const lastState = workflowStates[workflowStates.length - 1];

  return {
    today: {
      arrivalRate: computeArrivalRate(items, startToday, end, firstInProgressState),
      throughput: computeThroughput(items, startToday, end, lastState),
      wipAge: computeHistoricalWipAge(items, inProgressStates, end)
    },
    lastWeek: {
      arrivalRate: computeArrivalRate(items, startLastWeek, end, firstInProgressState),
      throughput: computeThroughput(items, startLastWeek, end, lastState),
      wipAge: computeHistoricalWipAge(items, inProgressStates, end)
    },
    lastMonth: {
      arrivalRate: computeArrivalRate(items, startLastMonth, end, firstInProgressState),
      throughput: computeThroughput(items, startLastMonth, end, lastState),
      wipAge: computeHistoricalWipAge(items, inProgressStates, end)
    }
  };
}