import { parseDate } from "../date/parseDate";
import { formatDate } from "./formatDate";
import { eachDay } from "./eachDay";

// Normalize workflow state → find matching key in item.entered
function getEnteredDate(item, state) {
  if (!item.entered) return null;

  // 1. Exact match
  if (state in item.entered) return item.entered[state];

  // 2. Legacy Jira-style: entered_StateName
  const legacy = `entered_${state}`;
  if (legacy in item.entered) return item.entered[legacy];

  // 3. Replace spaces with underscores
  const underscores = state.replace(/\s+/g, "_");
  if (underscores in item.entered) return item.entered[underscores];

  // 4. Remove spaces entirely
  const noSpaces = state.replace(/\s+/g, "");
  if (noSpaces in item.entered) return item.entered[noSpaces];

  // 5. Lowercase comparison (last resort)
  const lowerKeys = Object.keys(item.entered).reduce((acc, k) => {
    acc[k.toLowerCase()] = item.entered[k];
    return acc;
  }, {});
  const lowerState = state.toLowerCase();
  if (lowerState in lowerKeys) return lowerKeys[lowerState];

  return null;
}

export function computeCfd(items, workflowStates) {
  if (!items || items.length === 0) return [];

  const allDates = [];

  // Collect all relevant dates
  items.forEach((item) => {
    const start = parseDate(item.cycleStart);
    const end = parseDate(item.cycleEnd);

    if (start) allDates.push(start);
    if (end) allDates.push(end);

    workflowStates.forEach((state) => {
      const raw = getEnteredDate(item, state);
      const parsed = parseDate(raw);
      if (parsed) allDates.push(parsed);
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
        const raw = getEnteredDate(item, state);
        const entered = parseDate(raw);
        return entered && entered <= day;
      }).length;

      row[state] = count;
    });

    return row;
  });
}