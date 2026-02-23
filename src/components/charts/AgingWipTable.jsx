import React from "react";

export default function AgingWipTable({ data }) {
  if (!data || !data.length) return <div>No aging WIP</div>;

  return (
    <div>
      <h3>Aging Work in Progress</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>State</th>
            <th>Started</th>
            <th>Age (days)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((i) => (
            <tr key={i.id}>
              <td>{i.id}</td>
              <td>{i.title}</td>
              <td>{i.state}</td>
              <td>{i.started}</td>
              <td>{i.age.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}