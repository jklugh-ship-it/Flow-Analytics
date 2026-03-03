export default function Wip({ wipItems, stateCounts }) {
  const total = wipItems?.length ?? 0;

  // Keep all states visible except Resolved (always zero for WIP)
  const filteredStates = Object.entries(stateCounts || {}).filter(
    ([state]) => state !== "Resolved"
  );

  return (
    <div className="metric-block wip-block">
      <p className="wip-total" style={{ textAlign: "center" }}>
        <strong>{total}</strong>
        <br />
        items are currently in progress
      </p>

      <div className="wip-states" style={{ marginTop: "0.5rem" }}>
        {filteredStates.map(([state, count]) => {
          const showTooltip = state === "Ready";

          return (
            <div
              key={state}
              className="wip-state-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "2px 0",
                fontSize: "0.9rem"
              }}
            >
              <span
                className="wip-state-name"
                style={{ color: "#444", cursor: showTooltip ? "help" : "default" }}
                title={
                  showTooltip
                    ? "Items appear in Ready when they previously entered an in‑progress state but moved backward or have not yet progressed again."
                    : undefined
                }
              >
                {state}
              </span>
              <span className="wip-state-count" style={{ fontWeight: 600 }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}