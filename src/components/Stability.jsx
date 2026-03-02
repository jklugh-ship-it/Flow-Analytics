// Stability.jsx
export default function Stability({ today, lastWeek, lastMonth }) {
  const rows = [
    { label: "Today", data: today },
    { label: "Last Week", data: lastWeek },
    { label: "Last Month", data: lastMonth }
  ];

  return (
    <div className="metric-block">
      <table className="stability-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Arrival Rate</th>
            <th>Throughput</th>
            <th>WIP Age</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, data }) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{data?.arrivalRate ?? "—"}</td>
              <td>{data?.throughput ?? "—"}</td>
              <td>{data?.wipAge ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}