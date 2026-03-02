// CycleTime.jsx
export default function CycleTime({ percentiles }) {
  if (!percentiles) return null;

  const { p50, p85, p95 } = percentiles;

  return (
    <div className="metric-block">
      <p>
        95% of items were completed in <strong>{p95}</strong> days or less,
        85% of items were completed in <strong>{p85}</strong> days or less,
        and 50% of items were completed in <strong>{p50}</strong> days or less.
      </p>
    </div>
  );
}