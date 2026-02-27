// ------------------------------------------------------------
// DATE UTILITIES
// ------------------------------------------------------------
export function parseDate(value) {
  if (!value) return null;

  // Already a Date
  if (value instanceof Date) return value;

  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  //
  // 1. ISO: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ
  //
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);

    if (isNaN(d)) return null;

    // Extract the date portion from both input and parsed date
    const inputDate = trimmed.slice(0, 10);
    const parsedDate = d.toISOString().slice(0, 10);

    // Reject rollover or timezone-shifted mismatches
    if (inputDate !== parsedDate) return null;

    return d; // Keep the Date object as-is (your original behavior)
  }

  //
  // 2. US format: M/D/YYYY or MM/DD/YYYY
  //
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [m, d, y] = trimmed.split("/").map(Number);

    // Basic range checks
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;

    // Construct in UTC to avoid timezone drift
    const date = new Date(Date.UTC(y, m - 1, d));

    // Reject rollover (e.g., 2/32/2025 → Mar 3)
    if (
      date.getUTCFullYear() !== y ||
      date.getUTCMonth() !== m - 1 ||
      date.getUTCDate() !== d
    ) {
      return null;
    }

    return date;
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
export function computeCfd(items, workflowStates) {
  if (!items || items.length === 0) return [];

  // ------------------------------------------------------------
  // Collect all dates that matter for the CFD timeline
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Build CFD rows
  // ------------------------------------------------------------
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
// ------------------------------------------------------------
// WIP RUN
// ------------------------------------------------------------
export function computeWipRun(items) {
  if (!items || items.length === 0) return [];

  const allDates = [];

  items.forEach((item) => {
    if (item.created instanceof Date) {
      const d = new Date(item.created);
      d.setHours(0, 0, 0, 0);
      allDates.push(d);
    }
    if (item.completed instanceof Date) {
      const d = new Date(item.completed);
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
      if (item.completed instanceof Date) {
        end = new Date(item.completed);
        end.setHours(0, 0, 0, 0);
      }

      return start <= day && (!end || end > day);
    }).length;

    return { date: formatDate(day), count };
  });
}
// -------------------------------------------------------
// THROUGHPUT RUN (start at earliest entry date + zero-fill to today)
// -------------------------------------------------------
export function computeThroughputRun(items) {
  if (!items || items.length === 0) return [];

  // 1. Count completions by UTC date (cycleEnd is authoritative)
  const counts = {};
  items.forEach((item) => {
    const end = item.cycleEnd;
    if (end instanceof Date) {
      // Extract UTC date (YYYY-MM-DD)
      const iso = end.toISOString().slice(0, 10);
      counts[iso] = (counts[iso] || 0) + 1;
    }
  });

  // 2. Find earliest entry date across ALL workflow states
  const allEntryDates = [];

  items.forEach((item) => {
    if (item.entered) {
      Object.values(item.entered).forEach((d) => {
        if (d instanceof Date) allEntryDates.push(d);
      });
    }
  });

  if (allEntryDates.length === 0) return [];

  // Normalize earliest entry to UTC midnight
  const firstEntry = new Date(
    Date.UTC(
      allEntryDates[0].getUTCFullYear(),
      allEntryDates[0].getUTCMonth(),
      allEntryDates[0].getUTCDate()
    )
  );

  // 3. End at today (UTC midnight)
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // 4. Build continuous timeline with zero-fill
  const run = [];
  let cursor = new Date(firstEntry);

  while (cursor <= today) {
    const iso = cursor.toISOString().slice(0, 10);
    run.push({
      date: iso,
      count: counts[iso] || 0
    });

    // Advance by 1 day (UTC)
    cursor = new Date(Date.UTC(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth(),
      cursor.getUTCDate() + 1
    ));
  }

  return run;
}
// ------------------------------------------------------------
// CYCLE TIME HISTOGRAM
// ------------------------------------------------------------
export function computeCycleTimeHistogram(items) {
  if (!items || items.length === 0) return [];

  const buckets = {};

  items.forEach((i) => {
    const start = i.cycleStart;
    const end = i.cycleEnd;

    if (!start || !end) return;

    // daysBetween should already normalize to local midnight
    const ct = daysBetween(start, end);

    // eliminate 0-day cycle times
    const safeCt = Math.max(ct, 1);

    buckets[safeCt] = (buckets[safeCt] || 0) + 1;
  });

  return Object.entries(buckets).map(([value, count]) => ({
    value: Number(value),
    count
  }));
}


// ------------------------------------------------------------
// CYCLE TIME SCATTER
// ------------------------------------------------------------
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
// ------------------------------------------------------------
// CYCLE TIME (DAYS) — PURE UTILITY
// ------------------------------------------------------------
export function computeCycleTimeDays(item) {
  if (!(item.cycleStart instanceof Date)) return null;
  if (!(item.cycleEnd instanceof Date)) return null;

  const ms = item.cycleEnd.getTime() - item.cycleStart.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1; // inclusive
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  const w = idx - lower;
  return Math.round(sorted[lower] * (1 - w) + sorted[upper] * w);
}

// ------------------------------------------------------------
// CYCLE TIME PERCENTILES (50, 70, 85, 95)
// ------------------------------------------------------------
export function computeCycleTimePercentiles(items) {
  const values = items
    .map(computeCycleTimeDays)
    .filter((v) => typeof v === "number")
    .sort((a, b) => a - b);

  return {
    p50: percentile(values, 50),
    p70: percentile(values, 70),
    p85: percentile(values, 85),
    p95: percentile(values, 95)
  };
}

// ------------------------------------------------------------
// CURRENT WORKFLOW STATE (LAST ENTERED STATE)
// ------------------------------------------------------------
export function getCurrentState(item, workflowStates) {
  const entered = item.entered || {};
  let lastState = null;

  workflowStates.forEach((state) => {
    const d =
      entered[`entered_${state}`] ??
      entered[state];

    if (d instanceof Date) {
      lastState = state;
    }
  });

  return lastState;
}

// ------------------------------------------------------------
// AGING WIP (ONLY IN-PROGRESS ITEMS)
// ------------------------------------------------------------
export function computeAgingWip(items, workflowStates) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const points = [];

  items.forEach((item) => {
    // Must have started
    if (!(item.cycleStart instanceof Date)) return;

    // Must NOT be completed
    if (item.cycleEnd instanceof Date) return;

    const currentState = getCurrentState(item, workflowStates);
    if (!currentState) return;

    const ageMs = today.getTime() - item.cycleStart.getTime();
    const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000)) + 1;

    points.push({
      id: item.id,
      state: currentState,
      ageDays
    });
  });

  return points;
}