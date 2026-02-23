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
// NORMALIZATION (dynamic workflow + merged-state support)
// ------------------------------------------------------------
export function normalizeItems(rawItems, workflowStates) {
  if (!workflowStates || workflowStates.length === 0) {
    console.error("normalizeItems called without workflowStates");
    return [];
  }

  const firstState = workflowStates[0];
  const lastState = workflowStates[workflowStates.length - 1];

  return rawItems
    .filter((r) => r && Object.keys(r).length > 0)
    .map((r, index) => {
      const created =
        parseDate(r.created_date) ||
        parseDate(r.started_date) ||
        null;

      const completed = parseDate(r.completed_date) || null;

      // --------------------------------------------------------
      // Extract transitions dynamically, including merged states
      // --------------------------------------------------------
      const transitions = {};
      const inferred = {};

      workflowStates.forEach((state) => {
        // Find all CSV columns that match this state
        // Example: merged state "Build" might match:
        // entered_Refinement, entered_Development
        const matchingCols = Object.keys(r).filter((k) =>
          k.startsWith("entered_") &&
          k.replace("entered_", "").toLowerCase() === state.toLowerCase()
        );

        // If no exact match, fallback to prefix match (merged states)
        const fallbackCols = Object.keys(r).filter((k) =>
          k.startsWith("entered_") &&
          k.toLowerCase().includes(state.toLowerCase())
        );

        const colsToUse =
          matchingCols.length > 0 ? matchingCols : fallbackCols;

        const dates = colsToUse
          .map((c) => parseDate(r[c]))
          .filter(Boolean);

        const val =
          dates.length > 0 ? new Date(Math.min(...dates)) : null;

        transitions[state] = val;
        inferred[state] = val ? false : null;
      });

      const hasAnyTransition = workflowStates.some(
        (s) => transitions[s] != null
      );

      // --------------------------------------------------------
      // CASE 1: Completed but no transitions → infer backwards
      // --------------------------------------------------------
      if (completed && !hasAnyTransition) {
        transitions[lastState] = completed;
        inferred[lastState] = true;

        for (let i = workflowStates.length - 2; i >= 0; i--) {
          const s = workflowStates[i];
          transitions[s] = transitions[workflowStates[i + 1]];
          inferred[s] = true;
        }
      } else {
        // --------------------------------------------------------
        // CASE 2: Partial transitions → enforce monotonicity
        // --------------------------------------------------------
        let lastSeen = null;
        workflowStates.forEach((state) => {
          const t = transitions[state];
          if (t && lastSeen && t < lastSeen) {
            transitions[state] = lastSeen;
            inferred[state] = true;
          }
          if (transitions[state]) {
            lastSeen = transitions[state];
          }
        });

        // If first state missing but later states exist → infer earliest
        if (!transitions[firstState]) {
          const earliest = workflowStates
            .map((s) => transitions[s])
            .filter(Boolean)
            .sort((a, b) => a - b)[0];

          if (earliest) {
            transitions[firstState] = earliest;
            inferred[firstState] = true;
          }
        }

        // If completed exists but last state missing → infer it
        if (completed && !transitions[lastState]) {
          transitions[lastState] = completed;
          inferred[lastState] = true;
        }
      }

      // Mark remaining nulls as explicitly not inferred
      workflowStates.forEach((s) => {
        if (inferred[s] === null) inferred[s] = false;
      });

      const started =
        transitions[firstState] ||
        created ||
        null;

      return {
        id: r.id || `item-${index + 1}`,
        title: r.title || `Item ${index + 1}`,
        created,
        completed,
        transitions,
        inferred,
        started,
        cycleTime:
          completed && started ? daysBetween(started, completed) : null
      };
    })
    .filter((i) => i.created || i.started || i.completed);
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
// CFD
// ------------------------------------------------------------
export function computeCfd(items, workflowStates) {
  if (!items || items.length === 0) return [];

  const minDate = new Date(
    Math.min(
      ...items
        .map((i) => i.started || i.created)
        .filter(Boolean)
        .map((d) => d.getTime())
    )
  );

  const maxDate = new Date(
    Math.max(
      ...items
        .map((i) => i.completed || i.started || i.created)
        .filter(Boolean)
        .map((d) => d.getTime())
    )
  );

  const days = eachDay(minDate, maxDate);

  return days.map((day) => {
    const row = { date: formatDate(day) };

    workflowStates.forEach((state) => {
      row[state] = items.filter((item) => {
        const t = item.transitions[state];
        return t && t <= day;
      }).length;
    });

    return row;
  });
}

// ------------------------------------------------------------
// WIP RUN
// ------------------------------------------------------------
export function computeWipRun(items) {
  if (!items || items.length === 0) return [];

  const minDate = new Date(
    Math.min(
      ...items
        .map((i) => i.started || i.created)
        .filter(Boolean)
        .map((d) => d.getTime())
    )
  );

  const maxDate = new Date(
    Math.max(
      ...items
        .map((i) => i.completed || i.started || i.created)
        .filter(Boolean)
        .map((d) => d.getTime())
    )
  );

  const days = eachDay(minDate, maxDate);

  return days.map((day) => {
    const count = items.filter((item) => {
      const start = item.started;
      const end = item.completed;
      return start && start <= day && (!end || end > day);
    }).length;

    return { date: formatDate(day), count };
  });
}

// ------------------------------------------------------------
// THROUGHPUT RUN
// ------------------------------------------------------------
export function computeThroughputRun(items) {
  if (!items || items.length === 0) return [];

  const completed = items.filter((i) => i.completed);

  if (completed.length === 0) return [];

  const minDate = new Date(
    Math.min(...completed.map((i) => i.completed.getTime()))
  );

  const maxDate = new Date(
    Math.max(...completed.map((i) => i.completed.getTime()))
  );

  const days = eachDay(minDate, maxDate);

  return days.map((day) => {
    const count = completed.filter(
      (i) => formatDate(i.completed) === formatDate(day)
    ).length;

    return { date: formatDate(day), count };
  });
}

// ------------------------------------------------------------
// CYCLE TIME HISTOGRAM
// ------------------------------------------------------------
export function computeCycleTimeHistogram(items) {
  const completed = items.filter((i) => i.cycleTime != null);
  const buckets = {};

  completed.forEach((i) => {
    const ct = i.cycleTime;
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
export function computeCycleTimeScatter(items) {
  return items
    .filter((i) => i.completed && i.cycleTime != null)
    .map((i) => ({
      date: formatDate(i.completed),
      value: i.cycleTime
    }));
}