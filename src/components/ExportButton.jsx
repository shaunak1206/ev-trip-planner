// src/components/ExportButton.jsx
import React from 'react';

export default function ExportButton({ start, stops, end }) {
  const handleExport = () => {
    // Guard
    if (!start || !end) {
      alert('No route to export yet.');
      return;
    }

    // Google wants "lat,lng" for origin & destination:
    const origin      = encodeURIComponent(`${start[1]},${start[0]}`);
    const destination = encodeURIComponent(`${end[1]},${end[0]}`);

    // waypoints already mapped as lat,lng:
    const waypointStr = stops
      .map(s => `${s.coord[1]},${s.coord[0]}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1` +
              `&origin=${origin}` +
              `&destination=${destination}`;

    if (waypointStr) {
      url += `&waypoints=${encodeURIComponent(waypointStr)}`;
    }

    window.open(url, '_blank');
  };

  return (
    <button className="export-btn" onClick={handleExport}>
      Export to Google Maps
    </button>
  );
}
