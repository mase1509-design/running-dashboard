import React from 'react';

export default function EventTable({ entries }) {
  if (!entries || entries.length === 0) {
    return <div className="empty">Noch keine Einträge.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Distanz (km)</th>
            <th>Dauer</th>
            <th>km/h</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td style={{ textAlign: 'right' }}>{e.distanceKm}</td>
              <td style={{ textAlign: 'right' }}>
                {e.durationMin} min {e.durationSec}s
              </td>
              <td style={{ textAlign: 'right' }}>{e.speedKmh}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
