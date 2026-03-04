// src/utils/metrics/computeStability.js

import { computeArrivalRate } from "./computeArrivalRate";
import { computeThroughput } from "./computeThroughput";
import { computeHistoricalWipAge } from "./computeHistoricalWipAge";

export function computeStability(items, inProgressStates, today, workflowStates) {
  const end = new Date(today);
  const oneDay = 1000 * 60 * 60 * 24;

  const startToday = new Date(end);
  startToday.setHours(0, 0, 0, 0);

  const startLastWeek = new Date(end - 7 * oneDay);
  const startLastMonth = new Date(end - 30 * oneDay);

  // Historical snapshot dates for WIP age
  const asOfToday = end;
  const asOfLastWeek = new Date(end - 7 * oneDay);
  const asOfLastMonth = new Date(end - 30 * oneDay);

  // Derive dynamic state names from workflow
  const firstInProgressState = workflowStates
    ? workflowStates.find((s) => inProgressStates.includes(s))
    : null;
  const lastState = workflowStates
    ? workflowStates[workflowStates.length - 1]
    : null;

  return {
    today: {
      arrivalRate: firstInProgressState
        ? computeArrivalRate(items, startToday, end, firstInProgressState)
        : 0,
      throughput: lastState
        ? computeThroughput(items, startToday, end, lastState)
        : 0,
      wipAge: computeHistoricalWipAge(items, inProgressStates, asOfToday)
    },
    lastWeek: {
      arrivalRate: firstInProgressState
        ? computeArrivalRate(items, startLastWeek, end, firstInProgressState)
        : 0,
      throughput: lastState
        ? computeThroughput(items, startLastWeek, end, lastState)
        : 0,
      wipAge: computeHistoricalWipAge(items, inProgressStates, asOfLastWeek)
    },
    lastMonth: {
      arrivalRate: firstInProgressState
        ? computeArrivalRate(items, startLastMonth, end, firstInProgressState)
        : 0,
      throughput: lastState
        ? computeThroughput(items, startLastMonth, end, lastState)
        : 0,
      wipAge: computeHistoricalWipAge(items, inProgressStates, asOfLastMonth)
    }
  };
}
