// ------------------------------------------------------------
// DATE UTILITIES
// ------------------------------------------------------------
export function parseDate(value) {
  if (!value) return null;

  // Already a Date
  if (value instanceof Date) return value;

  // Native parse (handles ISO, RFC, etc.)
  const d1 = new Date(value);
  if (!isNaN(d1)) return d1;

  // Handle MM/DD/YYYY
  if (typeof value === "string" && value.includes("/")) {
    const parts = value.split("/");
    if (parts.length === 3) {
      const [m, d, y] = parts.map((p) => parseInt(p, 10));
      const d2 = new Date(y, m - 1, d);
      if (!isNaN(d2)) return d2;
    }
  }

  return null;
}

export function daysBetween(a, b) {
  if (!a || !b) return null;
  const ms = b - a;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// ------------------------------------------------------------
// METRIC UTILITIES
// ------------------------------------------------------------
export function eachDay(start, end) {
  const days = [];
  const d = new Date(start);
  while (d <= end) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function formatDate(d) {
  return d.toISOString().split("T")[0];
}

// ------------------------------------------------------------
// CFD (Cumulative Flow Diagram)
// ------------------------------------------------------------
//
// New item shape:
// {
//   created: "YYYY-MM-DD" | null,
//   completed: "YYYY-MM-DD" | null,
//   entered: { [state]: "YYYY-MM-DD" | null }
// }
//
// Output shape (unchanged):
// [
//   { date: "2025-01-01", Refinement: 3, Development: 2, Testing: 1, Done: 0 },
//   ...
// ]
//
export function computeCfd(items, workflowStates) {
  if (!items || items.length === 0) return [];

  // Determine overall date range from entered dates / created / completed
  const allDates = [];

  items.forEach((item) => {
    if (item.created) {
      const d = parseDate(item.created);
      if (d) allDates.push(d);
    }
    if (item.completed) {
      const d = parseDate(item.completed);
      if (d) allDates.push(d);
    }
    workflowStates.forEach((state) => {
      const v = item.entered?.[state];
      if (v) {
        const d = parseDate(v);
        if (d) allDates.push(d);
      }
    });
  });

  if (allDates.length === 0) return [];

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const days = eachDay(minDate, maxDate);

  return days.map((day) => {
    const row = { date: formatDate(day) };

    workflowStates.forEach((state) => {
      const count = items.filter((item) => {
        const enteredStr = item.entered?.[state];
        if (!enteredStr) return false;
        const enteredDate = parseDate(enteredStr);
        return enteredDate && enteredDate <= day;
      }).length;

      row[state] = count;
    });

    return row;
  });
}

// ------------------------------------------------------------
// WIP RUN
// ------------------------------------------------------------
//
// Output shape (unchanged):
// [
//   { date: "2025-01-01", count: 5 },
//   ...
// ]
//
export function computeWipRun(items) {
  if (!items || items.length === 0) return [];

  const allDates = [];

  items.forEach((item) => {
    if (item.created) {
      const d = parseDate(item.created);
      if (d) allDates.push(d);
    }
    if (item.completed) {
      const d = parseDate(item.completed);
      if (d) allDates.push(d);
    }
  });

  if (allDates.length === 0) return [];

  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const days = eachDay(minDate, maxDate);

  return days.map((day) => {
    const count = items.filter((item) => {
      const start = item.created ? parseDate(item.created) : null;
      const end = item.completed ? parseDate(item.completed) : null;
      return start && start <= day && (!end || end > day);
    }).length;

    return { date: formatDate(day), count };
  });
}

// ------------------------------------------------------------
// THROUGHPUT RUN
// ------------------------------------------------------------
//
// Output shape (unchanged):
// [
//   { date: "2025-01-12", count: 3 },
//   ...
// ]
//
export function computeThroughputRun(items) {
  if (!items || items.length === 0) return [];

  const completed = items
    .filter((i) => i.completed)
    .map((i) => parseDate(i.completed))
    .filter(Boolean);

  if (completed.length === 0) return [];

  const minDate = new Date(Math.min(...completed.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...completed.map((d) => d.getTime())));
  const days = eachDay(minDate, maxDate);

  return days.map((day) => {
    const count = items.filter((i) => {
      if (!i.completed) return false;
      const cd = parseDate(i.completed);
      return cd && formatDate(cd) === formatDate(day);
    }).length;

    return { date: formatDate(day), count };
  });
}

// ------------------------------------------------------------
// CYCLE TIME HISTOGRAM
// ------------------------------------------------------------
//
// Output shape (unchanged):
// [
//   { value: 3, count: 5 },
//   ...
// ]
//
export function computeCycleTimeHistogram(items) {
  const buckets = {};

  items.forEach((i) => {
    if (!i.created || !i.completed) return;

    const start = parseDate(i.created);
    const end = parseDate(i.completed);
    if (!start || !end) return;

    const ct = daysBetween(start, end);
    if (ct == null) return;

    buckets[ct] = (buckets[ct] || 0) + 1;
  });

  return Object.entries(buckets).map(([value, count]) => ({
    value: Number(value),
    count
  }));
}

// ------------------------------------------------------------
// CYCLE TIME SCATTER
// ------------------------------------------------------------
//
// Output shape (unchanged):
// [
//   { date: "2025-01-12", value: 9 },
//   ...
// ]
//
export function computeCycleTimeScatter(items) {
  return items
    .filter((i) => i.created && i.completed)
    .map((i) => {
      const start = parseDate(i.created);
      const end = parseDate(i.completed);
      const ct = daysBetween(start, end);

      return {
        date: i.completed,
        value: ct
      };
    });
}