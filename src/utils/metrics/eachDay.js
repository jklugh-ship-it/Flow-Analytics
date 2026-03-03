// src/utils/metrics/eachDay.js

export function eachDay(start, end) {
  const days = [];
  if (!start || !end || start > end) return days;

  let cursor = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  ));

  const endUtc = new Date(Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate()
  ));

  while (cursor <= endUtc) {
    days.push(new Date(cursor));
    cursor = new Date(Date.UTC(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth(),
      cursor.getUTCDate() + 1
    ));
  }

  return days;
}