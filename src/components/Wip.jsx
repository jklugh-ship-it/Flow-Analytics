// Wip.jsx
export default function Wip({ wipItems, stateCounts }) {
  const total = wipItems?.length ?? 0;
  const states = Object.entries(stateCounts || {});

  return (
    <div className="metric-block">
      <p>
        <strong>{total}</strong> items are currently in progress.
      </p>

      {states.length > 0 && (
        <ul>
          {states.map(([state, count]) => (
            <li key={state}>
              {state}: <strong>{count}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}