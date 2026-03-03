// src/utils/metrics/computeHistoricalWipAge.js

function wasWipOnDate(item, inProgressStates, date) {
  const asOf = new Date(date);

  const enteredDates = inProgressStates
    .map((state) => item[`entered_${state}`])
    .filter((d) => d instanceof Date);

  if (enteredDates.length === 0) return false;

  const earliest = new Date(Math.min(...enteredDates.map((d) => d.getTime())));

  if (earliest > asOf) return false;

  // Use cycleEnd instead of entered_Resolved
  if (item.cycleEnd instanceof Date && item.cycleEnd <= asOf) return false;

  return true;
}

function wipAgeOnDate(item, inProgressStates, date) {
  const asOf = new Date(date);

  const enteredDates = inProgressStates
    .map((state) => item[`entered_${state}`])
    .filter((d) => d instanceof Date);

  if (enteredDates.length === 0) return null;

  const earliest = new Date(Math.min(...enteredDates.map((d) => d.getTime())));

  if (earliest > asOf) return null;

  const ageDays = Math.floor((asOf - earliest) / (1000 * 60 * 60 * 24));
  return ageDays >= 0 ? ageDays : null;
}

export function computeHistoricalWipAge(items, inProgressStates, windowEnd) {
  const ages = items
    .filter((item) => wasWipOnDate(item, inProgressStates, windowEnd))
    .map((item) => wipAgeOnDate(item, inProgressStates, windowEnd))
    .filter((x) => x !== null);

  if (ages.length === 0) return 0;

  const avg = ages.reduce((a, b) => a + b, 0) / ages.length;
  return Math.round(avg);
}